const { chromium } = require('playwright');
const path = require('path');

async function captureSpecScreenshots() {
  const browser = await chromium.launch({ 
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';
  const screenshotsDir = path.join(__dirname, 'docs/screenshots/spec');

  console.log('🎬 Starting Specification Screenshots Capture (Simplified)...\n');

  try {
    // 1. User Management Overview
    console.log('📸 1/9: User Management List Overview...');
    await page.goto(`${baseUrl}/settings/people`);
    await page.waitForTimeout(2500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'user_management_list_overview.png')
    });
    console.log('✅ Saved\n');

    // 2. Invite User Modal
    console.log('📸 2/9: Invite User Modal...');
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'invite_user_modal.png')
    });
    console.log('✅ Saved\n');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 3. Roles List Overview
    console.log('📸 3/9: Roles List Overview...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'roles_list_overview.png')
    });
    console.log('✅ Saved\n');

    // 4. Badge Distinction Zoom
    console.log('📸 4/9: Role Badge Comparison Zoom...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_badge_comparison_zoom.png'),
      clip: { x: 280, y: 200, width: 600, height: 300 }
    });
    console.log('✅ Saved\n');

    // 5. Role Creation - Identity
    console.log('📸 5/9: Create Role - Step 1...');
    await page.click('button:has-text("Create Role")');
    await page.waitForTimeout(1500);
    
    // Fill any visible input
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length > 0) {
      await inputs[0].fill('Contractor Safety Lead');
    }
    
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Limited access for external safety auditors.');
    }
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'create_role_step1_identity.png')
    });
    console.log('✅ Saved\n');

    // 6. Permission Matrix
    console.log('📸 6/9: Create Role - Step 2...');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'create_role_step2_matrix.png')
    });
    console.log('✅ Saved\n');

    // 7. CMMS Indicator (without hover - just show it exists)
    console.log('📸 7/9: CMMS Integration Indicator...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'cmms_indicator_tooltip.png'),
      clip: { x: 300, y: 300, width: 800, height: 400 }
    });
    console.log('✅ Saved (Note: Manual hover needed for tooltip)\n');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 8. Role Detail View
    console.log('📸 8/9: Role Detail View...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2000);
    
    // Try to edit first custom role
    const kebabMenu = page.locator('button:has(svg)').filter({ hasText: /^$/ }).first();
    if (await kebabMenu.count() > 0) {
      await kebabMenu.click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Edit")');
      await page.waitForTimeout(1500);
    } else {
      await page.click('button:has-text("Create Role")');
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_detail_view.png')
    });
    console.log('✅ Saved\n');

    // 9. Warning Banner
    console.log('📸 9/9: Role Edit Warning Banner...');
    console.log('ℹ️  Note: Warning banner requires editing role with active users');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_edit_warning_banner.png')
    });
    console.log('✅ Saved (Check if warning is visible)\n');

    console.log('\n✨ All screenshots captured!');
    console.log(`📁 Location: ${screenshotsDir}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureSpecScreenshots();
