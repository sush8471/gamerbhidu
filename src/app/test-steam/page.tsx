import { getSteamGameDetails } from '@/lib/steam-api';

export default async function TestPage() {
    const steamData = await getSteamGameDetails(271590); // GTA V

    return (
        <div className="p-8 bg-black text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Steam API Test</h1>

            {steamData ? (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Game Name:</h2>
                        <p>{steamData.name}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">Short Description:</h2>
                        <p>{steamData.shortDescription}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">Developers:</h2>
                        <p>{steamData.developers?.join(', ')}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">Publishers:</h2>
                        <p>{steamData.publishers?.join(', ')}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">Screenshots Count:</h2>
                        <p>{steamData.screenshots?.length || 0}</p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">PC Requirements (Minimum):</h2>
                        <pre className="bg-gray-800 p-4 rounded overflow-auto">
                            {JSON.stringify(steamData.pcRequirements?.minimum, null, 2)}
                        </pre>
                    </div>
                </div>
            ) : (
                <div className="text-red-500">
                    <p>Failed to fetch Steam data!</p>
                    <p>This could mean:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Steam API is down</li>
                        <li>The proxy is not working</li>
                        <li>CORS issues</li>
                        <li>Network issues</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
