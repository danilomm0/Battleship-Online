function sendReq(diff) {
    // window.location.href = `/place-ships?difficulty=${diff}`;
    fetch(`/test?difficulty=${diff}`, {
        method: 'GET',
    })
    .then(response => {
        console.log('Redirect response:', response.url);
        // You won't usually need to handle anything; the browser handles the redirect
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
