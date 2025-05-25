export async function loginApi({ email, password }) {
    const res = await fetch('https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/user/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== 'OK') {
        throw new Error(data.message || 'Login failed');
    }

    // Trả về user và token
    return {
        user: data.data,
        token: data.token.access_token,
    };
}

// Hàm để gọi API với token
export async function apiCall(url, options = {}) {
    const token = await AsyncStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API call failed');
    }

    return data;
}