document.addEventListener("DOMContentLoaded", () => {
    const result = document.getElementById('result');
    let currentId = '';

    const logDebug = (message) => {
        document.getElementById('debug-console').checked ? console.log(message) : void 0;
    };

    const request = async (endpoint, method, data = null) => {
        logDebug(`Request to ${endpoint} with data: ${JSON.stringify(data)}`);
        try {
            const response = await fetch('https://gtfapi.cursom.hu/' + `${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : null
            });
            const json = await response.json();
            logDebug(`Response from ${endpoint}: ${JSON.stringify(json)}`);
            return json;
        } catch (error) {
            logDebug(`Error: ${error}`);
            return null;
        }
    };

    const handleGuess = async () => {
        const lang = document.getElementById('language-selector').value;
        const guess = document.getElementById('flag-input').value.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
        logDebug(`User guess: ${guess}`);
        const resultData = await request('flag-guess/check', 'POST', { id: currentId, guessed_name: guess, lang });
        
        switch (resultData?.isCorrect) {
            case true:
                result.textContent = 'Correct Flag!';
                result.className = 'correct';
                break;
            case false:
                result.textContent = 'Incorrect Flag!';
                result.className = 'incorrect';
                break;
            default:
                result.textContent = 'Error!';
                result.className = 'error';
        }

        loadFlag();
        setTimeout(() => {
            result.textContent = '';
            result.className = '';
        }, 1500);
    };

    const loadFlag = async () => {
        const lang = document.getElementById('language-selector').value;
        logDebug(`Generating flag for language: ${lang}`);
        const data = await request('flag-guess/generate', 'POST', { lang });
        
        data ? (document.getElementById('flag-image').src = data.flag_image_url, currentId = data.id) : void 0;

        document.getElementById('flag-image').onerror = () => {
            logDebug('Image failed to load. Generating new flag.');
            loadFlag();
        };
    };

    document.getElementById('regenerate').addEventListener('click', loadFlag);
    document.getElementById('guess-flag').addEventListener('click', handleGuess);

    loadFlag();
});