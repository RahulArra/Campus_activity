const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "Test@123",
    department: "Computer Science"
};

// Function to signup
async function testSignup() {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, testUser);
        console.log('Signup Success:', response.data);
        return true;
    } catch (error) {
        if (error.response?.data?.message === 'User already exists with this email') {
            console.log('User already exists - proceeding to login');
            return true;
        }
        console.error('Signup Error:', error.response?.data || error.message);
        return false;
    }
}

// Function to login
async function testLogin() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Success!');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
        return response.data.token;
    } catch (error) {
        console.error('Login Error:', error.response?.data || error.message);
        return null;
    }
}

// Function to test protected route
async function testProtectedRoute(token) {
    try {
        const response = await axios.get(`${API_URL}/templates`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Protected Route Success! Got', response.data.length, 'templates');
    } catch (error) {
        console.error('Protected Route Error:', error.response?.data || error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🏃 Starting Auth Tests...');
    console.log('\n1. Testing Signup...');
    await testSignup();
    
    console.log('\n2. Testing Login...');
    const token = await testLogin();
    
    if (token) {
        console.log('\n3. Testing Protected Route...');
        await testProtectedRoute(token);
    }
    
    console.log('\n✅ Tests Complete!');
}

// Run the tests
runTests();