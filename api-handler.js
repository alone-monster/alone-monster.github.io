// Yeh script window.fetch ko override karegi taaki direct Groq par request na jaye
const originalFetch = window.fetch;

window.fetch = async function (url, options) {
    // Agar request Groq API par ja rahi hai, toh use Vercel par mod do
    if (url && url.includes("api.groq.com")) {
        // Aapka Vercel deployment ka live URL path
        const VERCEL_API_URL = "https://alone-monster-github-io.vercel.app/api/chat"; 
        
        console.log("Redirecting request to secure Vercel Backend...");
        
        // Request ko badal kar Vercel par bhej rahe hain bina headers mein key leak kiye
        return originalFetch(VERCEL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: options.body // Jo message type kiya tha, wahi aage jayega
        });
    }
    
    // Baki sabhi normal requests waise hi chalengi
    return originalFetch(url, options);
};
