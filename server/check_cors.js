
fetch('http://127.0.0.1:5000/api/health', {
    headers: {
        'Origin': 'http://localhost:5173'
    }
}).then(res => {
    console.log('Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
}).catch(err => console.error(err));
