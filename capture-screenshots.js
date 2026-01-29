const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';
  const screenshotsDir = path.join(__dirname, 'docs/screenshots');

  console.log('🎬 Starting screenshot capture...\n');

  try {
    // 1. Custom Roles Page - Badge Colors (System vs Custom)
    console.log('📸 Capturing Custom Roles page (badges)...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-custom-roles-badges.png'),
      fullPage: false
    });
    console.log('✅ Saved: 01-custom-roles-badges.png\n');

    // 2. User Management Page - Badge Colors
    console.log('📸 Capturing User Management page (badges)...');
    await page.goto(`${baseUrl}/settings/people`);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-user-management-badges.png'),
      fullPage: false
    });
    console.log('✅ Saved: 02-user-management-badges.png\n');

    // 3. Profile Switcher - Global Admin (header closeup)
    console.log('📸 Capturing Profile Switcher (Global Admin)...');
    await page.goto(`${baseUrl}/`);
    await page.waitForTimeout(1500);
    
    // Click profile switcher to open dropdown
    await page.click('button:has-text("Global Admin")');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-profile-switcher-dropdown.png'),
      fullPage: false,
      clip: { x: 1200, y: 0, width: 720, height: 400 } // Crop to header area
    });
    console.log('✅ Saved: 03-profile-switcher-dropdown.png\n');

    // 4. Switch to Technician Profile (from the already open dropdown)
    console.log('📸 Switching to Technician profile...');
    await page.click('button:has-text("Technician")');
    await page.waitForTimeout(1000);
    console.log('✅ Switched to Technician\n');

    // 5. Access Points - Disabled Buttons (Technician)
    console.log('📸 Capturing Access Points with disabled buttons...');
    await page.goto(`${baseUrl}/access-points`);
    await page.waitForTimeout(2000);
    
    // Highlight disabled button area
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-access-points-technician-disabled.png'),
      fullPage: false
    });
    console.log('✅ Saved: 04-access-points-technician-disabled.png\n');

    // 6. CAPAs - All Actions Disabled (Technician)
    console.log('📸 Capturing CAPAs with disabled buttons...');
    await page.goto(`${baseUrl}/capas`);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-capas-technician-disabled.png'),
      fullPage: false
    });
    console.log('✅ Saved: 05-capas-technician-disabled.png\n');

    // 7. Safety Events - Create ENABLED for Technician
    console.log('📸 Capturing Safety Events with CREATE enabled...');
    await page.goto(`${baseUrl}/`);
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-safety-events-technician-create-enabled.png'),
      fullPage: false
    });
    console.log('✅ Saved: 06-safety-events-technician-create-enabled.png\n');

    // 8. Sidebar - Settings Hidden for Technician
    console.log('📸 Capturing Sidebar (Settings hidden)...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '07-sidebar-technician-no-settings.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 280, height: 1080 } // Crop to sidebar only
    });
    console.log('✅ Saved: 07-sidebar-technician-no-settings.png\n');

    // 9. Switch back to Global Admin
    console.log('📸 Switching back to Global Admin...');
    await page.click('button:has-text("Technician")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Global Admin")');
    await page.waitForTimeout(1000);

    // 10. Sidebar - Settings Visible for Global Admin
    console.log('📸 Capturing Sidebar (Settings visible)...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '08-sidebar-global-admin-with-settings.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 280, height: 1080 }
    });
    console.log('✅ Saved: 08-sidebar-global-admin-with-settings.png\n');

    // 11. Role Creation Modal - Description Field
    console.log('📸 Capturing Role Creation Modal with Description...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2000);
    
    // Click Create Role button
    await page.click('button:has-text("Create Role")');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '09-role-creation-modal-description.png'),
      fullPage: false
    });
    console.log('✅ Saved: 09-role-creation-modal-description.png\n');

    // 12. Custom Roles Table - Description Column
    console.log('📸 Capturing Custom Roles table with Description column...');
    await page.keyboard.press('Escape'); // Close modal
    await page.waitForTimeout(500);
    
    // Scroll to table
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, '10-custom-roles-table-description-column.png'),
      fullPage: false
    });
    console.log('✅ Saved: 10-custom-roles-table-description-column.png\n');

    console.log('\n✨ All screenshots captured successfully!');
    console.log(`📁 Location: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
