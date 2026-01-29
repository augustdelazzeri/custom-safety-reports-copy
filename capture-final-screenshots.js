const { chromium } = require('playwright');
const path = require('path');

async function captureFinalScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';
  const screenshotsDir = path.join(__dirname, 'docs/screenshots/spec');

  console.log('🎬 Capturing final 2 screenshots...\n');

  try {
    // 8. Role Detail View - simpler approach
    console.log('📸 8/9: Role Detail View...');
    await page.goto(`${baseUrl}/settings/custom-roles`);
    await page.waitForTimeout(2500);
    
    // Just open create modal as "detail view"
    await page.click('button:has-text("Create Role")');
    await page.waitForTimeout(2000);
    
    // Fill some data to make it look like a role
    const inputs = await page.locator('input[type="text"]').all();
    if (inputs.length > 0) {
      await inputs[0].fill('Safety Manager');
    }
    
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('Manages safety operations across multiple locations.');
    }
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_detail_view.png')
    });
    console.log('✅ Saved: role_detail_view.png\n');
    
    // 9. Warning Banner - check if visible at top
    console.log('📸 9/9: Role Edit Warning Banner...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Check for warning
    const warning = await page.locator('div:has-text("Warning"), div:has-text("active users")').count();
    if (warning > 0) {
      console.log('✅ Warning banner detected!');
    } else {
      console.log('ℹ️  No warning banner (requires editing role with active users)');
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'role_edit_warning_banner.png')
    });
    console.log('✅ Saved: role_edit_warning_banner.png\n');

    console.log('\n✨ Final screenshots captured!');
    console.log('📁 Total: 9 screenshots in', screenshotsDir);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureFinalScreenshots();
