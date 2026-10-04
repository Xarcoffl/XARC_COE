// End-to-end integration test suite
const BASE = 'http://localhost:3005';

async function runTests() {
  console.log('====================================================');
  console.log('AR/VR CENTRE OF EXCELLENCE - END-TO-END TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Verify Public HTML Pages
  const pages = [
    { path: '/', label: 'Home Page' },
    { path: '/about', label: 'About Page' },
    { path: '/verticals', label: 'Verticals Page' },
    { path: '/projects', label: 'Projects Showcase' },
    { path: '/projects/industrial-safety-training-vr', label: 'Individual Project Detail' },
    { path: '/events', label: 'Events Showcase' },
    { path: '/events/spatial-computing-hackathon-2026', label: 'Individual Event Detail' },
    { path: '/achievements', label: 'Achievements Showcase' },
    { path: '/industry', label: 'Industry Alliances' },
    { path: '/request', label: 'Request to Join Form' },
    { path: '/control/auth', label: 'Admin Login Page' },
    { path: '/control/content/request', label: 'Admin Request Form Editor' },
  ];

  for (const page of pages) {
    await check(`Public/Admin Page (${page.path}) returns HTTP 200`, async () => {
      const res = await fetch(`${BASE}${page.path}`);
      if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
      const text = await res.text();
      if (!text.includes('AR/VR') && !text.includes('Excellence')) {
        throw new Error('Page missing branding markup');
      }
    });
  }

  // 1b. Verify Footer Contact and Mail Details
  await check('Footer contains contact number and mail ID', async () => {
    const res = await fetch(`${BASE}/`);
    const text = await res.text();
    if (!text.includes('mailto:') || !text.includes('tel:')) {
      throw new Error('Footer missing contact number or mail ID');
    }
  });

  // 2. Student Request Submission (Public API)
  const testStudent = {
    full_name: 'Vigneshwaran R',
    register_number: '111422104088',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    section: 'B',
    email: 'vignesh.r@gmail.com',
    college_email: 'vignesh.r@gmail.com',
    mobile_number: '+91 99401 88888',
    interests: ['VR', 'AR', 'Simulation', 'Product Development'],
    experience_level: 'Intermediate',
    existing_skills: 'Unity, C#, Blender 3D modeling',
    motivation: 'I want to build surgical simulation tools and collaborate with the multidisciplinary medical team at the AR/VR CoE.',
  };

  await check('Student Request Submission (POST /api/public/requests)', async () => {
    // Check if duplicate exists from earlier run, if not submit
    const res = await fetch(`${BASE}/api/public/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    if (res.status !== 201 && res.status !== 409) {
      const err = await res.json();
      throw new Error(`Expected 201 or 409, got ${res.status}: ${err.message}`);
    }
  });

  // 3. Duplicate Prevention Check
  await check('Duplicate Request Prevention (409 Conflict)', async () => {
    const res = await fetch(`${BASE}/api/public/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStudent),
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate, got ${res.status}`);
    }
  });

  // 4. Privacy Check: Unauthenticated access to /api/admin/requests must return 401
  await check('Privacy Isolation: Unauthenticated Admin API returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE}/api/admin/requests`);
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    }
  });

  // 5. Admin Authentication
  let sessionCookie = '';
  await check('Admin Login (POST /api/auth/login)', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@coe.edu',
        password: 'Admin@ARVR2026!',
      }),
    });
    if (res.status !== 200) {
      const err = await res.json();
      throw new Error(`Expected 200 OK, got ${res.status}: ${err.message}`);
    }
    const rawCookie = res.headers.get('set-cookie');
    if (!rawCookie || !rawCookie.includes('arvr_admin_session')) {
      throw new Error('Did not receive arvr_admin_session HttpOnly cookie');
    }
    sessionCookie = rawCookie.split(';')[0];
  });

  // 6. Admin Dashboard Metrics
  await check('Admin Dashboard Data (GET /api/admin/dashboard)', async () => {
    const res = await fetch(`${BASE}/api/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats.counts) throw new Error('Missing dashboard counts');
  });

  // 7. Student Request Review & Status Workflow
  let targetRequestId = '';
  await check('Admin Pipeline: Retrieve submitted student request', async () => {
    const res = await fetch(`${BASE}/api/admin/requests?search=Vigneshwaran`, {
      headers: { Cookie: sessionCookie },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.requests || data.requests.length === 0) throw new Error('Submitted request not found in admin pipeline');
    targetRequestId = data.requests[0].id;
  });

  await check('Admin Pipeline: Transition status to WAITING', async () => {
    const res = await fetch(`${BASE}/api/admin/requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        id: targetRequestId,
        status: 'WAITING',
        internal_notes: 'Reviewed by CoE committee. Candidate assigned to batch B waiting list.',
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.request.status !== 'WAITING') throw new Error('Failed to update status to WAITING');
  });

  // 8. Rejection Workflow (User requirement: Cannot delete, can only be rejected)
  await check('Admin Pipeline: Transition status to REJECTED (Rejection Archive)', async () => {
    const res = await fetch(`${BASE}/api/admin/requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        id: targetRequestId,
        status: 'REJECTED',
        internal_notes: 'Prerequisites incomplete for current semester intake. Encouraged to reapply next cohort.',
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.request.status !== 'REJECTED') throw new Error('Failed to update status to REJECTED');
    if (!data.request.rejected_at) throw new Error('Missing rejected_at timestamp');
  });

  // 9. Deletion Prohibition: Deleting requests must be blocked with HTTP 400
  await check('Admin Pipeline: Deletion Prohibition enforced (DELETE /api/admin/requests returns 400)', async () => {
    const res = await fetch(`${BASE}/api/admin/requests?id=${targetRequestId}`, {
      method: 'DELETE',
      headers: { Cookie: sessionCookie },
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 Bad Request, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.message || !data.message.includes('cannot be deleted')) {
      throw new Error(`Expected rejection explanation message, got: ${JSON.stringify(data)}`);
    }
  });

  // 10. Admin Pipeline: Batch Status Transition
  await check('Admin Pipeline: Batch Status Transition (PATCH /api/admin/requests with ids)', async () => {
    const res = await fetch(`${BASE}/api/admin/requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        ids: [targetRequestId],
        status: 'JOINED',
        internal_notes: 'Batch inducted into XR cohort.',
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.count < 1) throw new Error('Failed to batch update status');
    if (data.requests[0].status !== 'JOINED') throw new Error('Status not updated to JOINED');
  });

  // 11. Admin Request Form Content Management
  await check('Admin Content: Manage Request Form (GET /api/admin/content?section=request)', async () => {
    const res = await fetch(`${BASE}/api/admin/content?section=request`, {
      headers: { Cookie: sessionCookie },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.content || !data.content.eligibility_criteria) {
      throw new Error('Failed to load request form content structure');
    }
  });

  await check('Admin Content: Update Request Form (POST /api/admin/content)', async () => {
    const getRes = await fetch(`${BASE}/api/admin/content?section=request`, {
      headers: { Cookie: sessionCookie },
    });
    const { content } = await getRes.json();
    content.subtitle = 'COHORT 2026-2027 INTAKE OPEN';

    const res = await fetch(`${BASE}/api/admin/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ section: 'request', content }),
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  });

  // 11. Public Request Form Dynamic Content
  await check('Public API: Content endpoint returns Request Form content', async () => {
    const res = await fetch(`${BASE}/api/public/content`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.request) {
      throw new Error('Public content endpoint missing request form configuration');
    }
  });

  // 12. Minimalist Footer Verification
  await check('Public Site: Minimalist Footer verified (Copyright-only)', async () => {
    const res = await fetch(`${BASE}/`);
    const html = await res.text();
    if (!html.includes('All Rights Reserved')) {
      throw new Error('Footer missing copyright statement');
    }
    // Check that verbose 4-column sections are removed
    if (html.includes('footer-links-grid') || html.includes('footer-nav-col')) {
      throw new Error('Footer still contains multi-column link elements');
    }
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
