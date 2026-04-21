const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let token = '';
let projectId = '';
let storyId = '';

async function testAPIs() {
  console.log('🚀 Starting API Integration Tests...\n');

  try {
    // 1. Auth - Register
    console.log('1. Testing Auth: Register...');
    const registerData = {
      email: `test_${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'QA Tester'
    };
    await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Register successful');

    // 2. Auth - Login
    console.log('2. Testing Auth: Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    token = loginRes.data.accessToken;
    console.log('✅ Login successful. Token received.');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. AI - Parse Requirement
    console.log('\n3. Testing AI: Parse Requirement...');
    const parseRes = await axios.post(`${BASE_URL}/ai/parse`, {
      rawInput: 'As a user, I want to be able to login with my email and password so that I can access my dashboard.'
    }, authHeaders);
    console.log('✅ AI Parse successful:', parseRes.data.title);

    // 4. Project - Create
    console.log('\n4. Testing Project: Create...');
    const projectRes = await axios.post(`${BASE_URL}/projects`, {
      name: 'API Test Project'
    }, authHeaders);
    projectId = projectRes.data.id;
    console.log('✅ Project creation successful. ID:', projectId);

    // 5. AI - Generate Test Plan
    console.log('\n5. Testing AI: Generate Test Plan...');
    const planRes = await axios.post(`${BASE_URL}/ai/test-plan`, {
      projectId,
      structuredData: parseRes.data
    }, authHeaders);
    console.log('✅ AI Test Plan generation successful:', planRes.data.title);

    // 6. Project - List Stories (to get a story ID for test cases)
    // Wait, if I parsed it, I might need to save it as a story first if the system expects stories.
    // The current ai.service handles manual data directly for plans, but for cases it usually expects a userStoryId.
    // Let's check the ai.controller test-cases endpoint.
    console.log('\n6. Checking User Stories...');
    const storiesRes = await axios.get(`${BASE_URL}/projects/${projectId}`, authHeaders);
    // If no stories, let's create one manually to test the generator
    if (!storiesRes.data.userStories || storiesRes.data.userStories.length === 0) {
      console.log('   Creating a manual story for testing...');
      const storyRes = await axios.post(`${BASE_URL}/projects/${projectId}/stories`, {
        title: parseRes.data.title,
        description: parseRes.data.description,
        acceptanceCriteria: parseRes.data.acceptanceCriteria.join('\n')
      }, authHeaders);
      storyId = storyRes.data.id;
    } else {
      storyId = storiesRes.data.userStories[0].id;
    }
    console.log('✅ Story available. ID:', storyId);

    // 7. AI - Generate Test Cases
    console.log('\n7. Testing AI: Generate Test Cases...');
    const casesRes = await axios.post(`${BASE_URL}/ai/test-cases/${storyId}`, {}, authHeaders);
    console.log('✅ AI Test Case generation successful. Count:', casesRes.data.length);

    // 8. Code Generator - Generate Code
    console.log('\n8. Testing Code Generator...');
    const codeRes = await axios.post(`${BASE_URL}/code-generator/project/${projectId}`, {}, authHeaders);
    console.log('✅ Code Generation triggered. Job started.');

    // 9. Jobs - List
    console.log('\n9. Testing Jobs Polling...');
    const jobsRes = await axios.get(`${BASE_URL}/jobs`, authHeaders);
    console.log('✅ Jobs retrieval successful. Total jobs:', jobsRes.data.length);

    console.log('\n✨ All API tests completed successfully!');
  } catch (error) {
    console.error('\n❌ API Test Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testAPIs();
