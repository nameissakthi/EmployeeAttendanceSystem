const { test, expect } = require('@playwright/test');

test('login and open manager dashboard', async ({ page }) => {
  // Try common dev ports (5173, then 5174)
  const hosts = ['127.0.0.1', 'localhost', '[::1]']
  const ports = [5173, 5174]
  let navigated = false
  for (const h of hosts) {
    for (const p of ports) {
      const url = `http://${h}:${p}/login`
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 3000 })
        navigated = true
        break
      } catch (err) {
        // try next host/port
      }
    }
    if (navigated) break
  }
  if (!navigated) throw new Error('Could not reach frontend dev server on ports 5173/5174')

  // Ensure the login form is present, otherwise capture debug output
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })
  } catch (err) {
    await page.screenshot({ path: 'frontend/tests/screenshots/login-page-debug.png', fullPage: true });
    const html = await page.content();
    const fs = require('fs');
    try { fs.writeFileSync('frontend/tests/screenshots/login-page-debug.html', html); } catch (e) {}
    throw new Error('Login form not found on the page — saved screenshot and HTML to frontend/tests/screenshots/')
  }

  // Fill login form
  await page.fill('input[type="email"]', 'manager@example.com');
  await page.fill('input[type="password"]', 'Password123');
  await page.click('button[type="submit"]');

  // Wait for navigation to manager route
  await page.waitForURL('**/manager', { timeout: 10000 });

  // Assert manager header present
  const header = await page.locator('h2').first().innerText();
  expect(header.toLowerCase()).toContain('manager');

  // Check employees table loads
  await expect(page.locator('text=Team Attendance')).toBeVisible({ timeout: 5000 });

  // Take a screenshot for verification
  await page.screenshot({ path: 'frontend/tests/screenshots/manager-dashboard.png', fullPage: true });
});
