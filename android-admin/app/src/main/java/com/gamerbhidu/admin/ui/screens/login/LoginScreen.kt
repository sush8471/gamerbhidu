package com.gamerbhidu.admin.ui.screens.login

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.Login
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gamerbhidu.admin.R
import com.gamerbhidu.admin.ui.theme.GamerBhiduAdminTheme
import com.gamerbhidu.admin.util.BiometricHelper
import kotlinx.coroutines.delay

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current
    val context = LocalContext.current
    val activity = context as? FragmentActivity
    var passwordVisible by remember { mutableStateOf(false) }

    val passwordFocusRequester = remember { FocusRequester() }

    // Intercept back button when on password step to cleanly return to email
    BackHandler(enabled = uiState.step == LoginStep.PASSWORD) {
        viewModel.backToEmail()
    }

    LaunchedEffect(Unit) {
        viewModel.checkBiometricStatus(context)
        if (BiometricHelper.isBiometricUnlockReady(context) && activity != null) {
            viewModel.signInWithBiometrics(activity)
        }
    }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) onLoginSuccess()
    }

    // Auto-focus password when advancing to Password step
    LaunchedEffect(uiState.step) {
        if (uiState.step == LoginStep.PASSWORD) {
            delay(200)
            runCatching { passwordFocusRequester.requestFocus() }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(GamerBhiduAdminTheme.colors.backgroundDeep)
    ) {
        // Ambient background glow behind logo
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 40.dp)
                .size(280.dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.06f),
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                )
                .blur(70.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(48.dp))

            // ── HERO: Prominent Gamer Bhidu Logo ─────────────────────────────
            Box(
                modifier = Modifier
                    .size(130.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(R.drawable.gamerbhidu_emblem),
                    contentDescription = "Gamer Bhidu Logo",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            Spacer(Modifier.height(20.dp))

            Text(
                text = "Gamer Bhidu",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = (-0.5).sp,
                    color = GamerBhiduAdminTheme.colors.textPrimary
                )
            )

            Spacer(Modifier.height(6.dp))

            Text(
                text = if (uiState.step == LoginStep.EMAIL) {
                    "Sign in to manage your store"
                } else {
                    "Enter your password to continue"
                },
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = GamerBhiduAdminTheme.colors.textSecondary,
                    textAlign = TextAlign.Center
                )
            )

            Spacer(Modifier.height(32.dp))

            // ── Error Banner ──────────────────────────────────────────────────
            AnimatedVisibility(
                visible = uiState.error != null,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically(),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .background(
                            color = GamerBhiduAdminTheme.colors.errorSubtle,
                            shape = RoundedCornerShape(12.dp)
                        )
                        .border(
                            width = 1.dp,
                            color = GamerBhiduAdminTheme.colors.error.copy(alpha = 0.35f),
                            shape = RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Warning,
                        contentDescription = null,
                        tint = GamerBhiduAdminTheme.colors.error,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        uiState.error ?: "",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = GamerBhiduAdminTheme.colors.error,
                            fontWeight = FontWeight.Medium
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // ── Multi-Step Form (Email then Password) ─────────────────────────
            AnimatedContent(
                targetState = uiState.step,
                transitionSpec = {
                    if (targetState == LoginStep.PASSWORD) {
                        (slideInHorizontally(animationSpec = tween(300)) { width -> width } + fadeIn(animationSpec = tween(300)))
                            .togetherWith(slideOutHorizontally(animationSpec = tween(280)) { width -> -width } + fadeOut(animationSpec = tween(250)))
                    } else {
                        (slideInHorizontally(animationSpec = tween(300)) { width -> -width } + fadeIn(animationSpec = tween(300)))
                            .togetherWith(slideOutHorizontally(animationSpec = tween(280)) { width -> width } + fadeOut(animationSpec = tween(250)))
                    }
                },
                label = "login_step_transition"
            ) { currentStep ->
                when (currentStep) {
                    LoginStep.EMAIL -> {
                        EmailStepContent(
                            email = uiState.email,
                            onEmailChange = viewModel::onEmailChange,
                            onContinue = {
                                focusManager.clearFocus()
                                viewModel.proceedToPassword()
                            },
                            canBiometricUnlock = uiState.canBiometricUnlock,
                            onBiometricUnlock = {
                                activity?.let { viewModel.signInWithBiometrics(it) }
                            }
                        )
                    }

                    LoginStep.PASSWORD -> {
                        PasswordStepContent(
                            email = uiState.email,
                            password = uiState.password,
                            passwordVisible = passwordVisible,
                            isLoading = uiState.isLoading,
                            focusRequester = passwordFocusRequester,
                            onPasswordChange = viewModel::onPasswordChange,
                            onTogglePasswordVisibility = { passwordVisible = !passwordVisible },
                            onBackToEmail = {
                                focusManager.clearFocus()
                                viewModel.backToEmail()
                            },
                            onSignIn = {
                                focusManager.clearFocus()
                                viewModel.signIn(context)
                            }
                        )
                    }
                }
            }

            Spacer(Modifier.height(40.dp))
        }
    }
}

/** Step 1: Clean Email Input Screen */
@Composable
private fun EmailStepContent(
    email: String,
    onEmailChange: (String) -> Unit,
    onContinue: () -> Unit,
    canBiometricUnlock: Boolean,
    onBiometricUnlock: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        ModernInputField(
            value = email,
            onValueChange = onEmailChange,
            label = "Email Address",
            placeholder = "admin@gamerbhidu.com",
            leadingIcon = Icons.Outlined.Email,
            trailingIcon = if (email.isNotEmpty()) {
                {
                    IconButton(onClick = { onEmailChange("") }) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Clear",
                            tint = GamerBhiduAdminTheme.colors.textTertiary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            } else null,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next
            ),
            keyboardActions = KeyboardActions(onNext = { onContinue() })
        )

        Button(
            onClick = onContinue,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = GamerBhiduAdminTheme.colors.primary,
                contentColor = Color.Black
            ),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
        ) {
            Text(
                "Continue",
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp
            )
            Spacer(Modifier.width(8.dp))
            Icon(
                Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
        }

        // Biometric Quick Unlock if available
        if (canBiometricUnlock) {
            Spacer(Modifier.height(4.dp))
            OutlinedButton(
                onClick = onBiometricUnlock,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.35f),
                    contentColor = GamerBhiduAdminTheme.colors.textPrimary
                ),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    GamerBhiduAdminTheme.colors.borderSubtle
                )
            ) {
                Icon(
                    Icons.Default.Fingerprint,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = GamerBhiduAdminTheme.colors.primary
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    "Quick Unlock with Biometrics",
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp
                )
            }
        }
    }
}

/** Step 2: Clean Password Input Screen */
@Composable
private fun PasswordStepContent(
    email: String,
    password: String,
    passwordVisible: Boolean,
    isLoading: Boolean,
    focusRequester: FocusRequester,
    onPasswordChange: (String) -> Unit,
    onTogglePasswordVisibility: () -> Unit,
    onBackToEmail: () -> Unit,
    onSignIn: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Editable email identity pill
        Row(
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .clip(RoundedCornerShape(20.dp))
                .background(GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.6f))
                .border(1.dp, GamerBhiduAdminTheme.colors.borderSubtle, RoundedCornerShape(20.dp))
                .clickable { onBackToEmail() }
                .padding(horizontal = 14.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                Icons.Outlined.AccountCircle,
                contentDescription = null,
                tint = GamerBhiduAdminTheme.colors.primary,
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = email,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontWeight = FontWeight.Medium,
                    color = GamerBhiduAdminTheme.colors.textPrimary
                )
            )
            Text(
                text = "Change",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = GamerBhiduAdminTheme.colors.primary
                )
            )
        }

        ModernInputField(
            value = password,
            onValueChange = onPasswordChange,
            label = "Password",
            placeholder = "••••••••",
            leadingIcon = Icons.Outlined.Lock,
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = onTogglePasswordVisibility) {
                    Icon(
                        imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = if (passwordVisible) "Hide password" else "Show password",
                        tint = GamerBhiduAdminTheme.colors.textSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            },
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { onSignIn() }),
            modifier = Modifier.focusRequester(focusRequester)
        )

        Button(
            onClick = onSignIn,
            enabled = !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = GamerBhiduAdminTheme.colors.primary,
                contentColor = Color.Black,
                disabledContainerColor = GamerBhiduAdminTheme.colors.primary.copy(alpha = 0.5f),
                disabledContentColor = Color.Black.copy(alpha = 0.5f)
            ),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.Black,
                    strokeWidth = 2.dp
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    "Signing in...",
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp
                )
            } else {
                Icon(
                    Icons.AutoMirrored.Filled.Login,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    "Sign In",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp
                )
            }
        }

        TextButton(
            onClick = onBackToEmail,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Icon(
                Icons.AutoMirrored.Outlined.ArrowBack,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = GamerBhiduAdminTheme.colors.textSecondary
            )
            Spacer(Modifier.width(6.dp))
            Text(
                "Use a different email",
                color = GamerBhiduAdminTheme.colors.textSecondary,
                fontSize = 13.sp
            )
        }
    }
}

/** Sleek modern input field with dark aesthetic */
@Composable
fun ModernInputField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    leadingIcon: ImageVector,
    modifier: Modifier = Modifier,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailingIcon: @Composable (() -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = GamerBhiduAdminTheme.colors.textSecondary,
                fontWeight = FontWeight.Medium,
                fontSize = 12.sp
            ),
            modifier = Modifier.padding(bottom = 6.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = {
                Text(
                    placeholder,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = GamerBhiduAdminTheme.colors.textTertiary
                    )
                )
            },
            leadingIcon = {
                Icon(
                    leadingIcon,
                    contentDescription = null,
                    tint = GamerBhiduAdminTheme.colors.textSecondary,
                    modifier = Modifier.size(18.dp)
                )
            },
            trailingIcon = trailingIcon,
            visualTransformation = visualTransformation,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                unfocusedTextColor = GamerBhiduAdminTheme.colors.textPrimary,
                cursorColor = GamerBhiduAdminTheme.colors.primary,
                focusedBorderColor = GamerBhiduAdminTheme.colors.primary,
                unfocusedBorderColor = GamerBhiduAdminTheme.colors.borderSubtle,
                focusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.5f),
                unfocusedContainerColor = GamerBhiduAdminTheme.colors.surfaceVariant.copy(alpha = 0.25f)
            ),
            textStyle = MaterialTheme.typography.bodyMedium.copy(color = GamerBhiduAdminTheme.colors.textPrimary)
        )
    }
}

/** Legacy alias for editor and other screens */
@Composable
fun AdminInputField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    leadingIcon: ImageVector,
    modifier: Modifier = Modifier,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailingIcon: @Composable (() -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    ModernInputField(
        value = value,
        onValueChange = onValueChange,
        label = label,
        placeholder = placeholder,
        leadingIcon = leadingIcon,
        modifier = modifier,
        visualTransformation = visualTransformation,
        trailingIcon = trailingIcon,
        keyboardOptions = keyboardOptions,
        keyboardActions = keyboardActions
    )
}

