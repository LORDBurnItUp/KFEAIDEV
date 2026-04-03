/**
 * KDS Welcome Email — Beautiful HTML email template
 * Sent when a new account is created
 */

export function generateWelcomeEmail(name: string, email: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kings Dripping Swag</title>
</head>
<body style="margin:0;padding:0;background:#02040a;font-family:'Helvetica Neue',Arial,sans-serif;">
  
  <!-- Container -->
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="width:80px;height:80px;margin:0 auto 20px;border-radius:20px;background:linear-gradient(135deg,rgba(191,245,73,0.2),rgba(191,245,73,0.05));border:2px solid rgba(191,245,73,0.3);display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;font-weight:900;color:#BFF549;">K</span>
      </div>
      <h1 style="color:#BFF549;font-size:28px;margin:0;font-weight:900;letter-spacing:-0.5px;">
        KINGS DRIPPING SWAG
      </h1>
      <p style="color:#5a5a6e;font-size:12px;margin-top:5px;letter-spacing:3px;text-transform:uppercase;">
        2130 • The Future Is Now
      </p>
    </div>
    
    <!-- Welcome Message -->
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:24px;margin:0 0 16px;font-weight:700;">
        Welcome to the future, ${name}! 🚀
      </h2>
      <p style="color:#99A1AF;font-size:16px;line-height:1.6;margin:0 0 16px;">
        You've just joined the most advanced AI community hub in existence. 
        We're not just a platform — we're a movement from the year 2130.
      </p>
      <p style="color:#99A1AF;font-size:16px;line-height:1.6;margin:0;">
        Here's what you can do right now:
      </p>
    </div>
    
    <!-- Features -->
    <div style="margin-bottom:24px;">
      ${generateFeatureCard('🧠', 'AI Community Hub', 'Connect with developers, CEOs, and engineers from another dimension.')}
      ${generateFeatureCard('🎯', 'Call Center Army', 'AI agents that make sales calls, qualify leads, and close deals.')}
      ${generateFeatureCard('🌐', '3D Sandbox', 'Interactive 3D environments, terrain generation, physics simulation.')}
      ${generateFeatureCard('🎤', 'Voice Agents', 'AI that speaks, listens, and responds in real-time.')}
    </div>
    
    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="https://kingsdrippingswag.io" style="display:inline-block;padding:16px 48px;background:#BFF549;color:#000;font-weight:700;font-size:18px;text-decoration:none;border-radius:999px;box-shadow:0 0 30px rgba(191,245,73,0.3);">
        Enter 2130 →
      </a>
    </div>
    
    <!-- Community Links -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="color:#99A1AF;font-size:14px;margin:0 0 16px;">Join the community:</p>
      <div style="display:flex;justify-content:center;gap:16px;">
        <a href="https://t.me/KDSAIDEV" style="color:#BFF549;text-decoration:none;font-size:14px;">Telegram</a>
        <span style="color:#333;">|</span>
        <a href="https://discord.gg/DOUGLAS" style="color:#60a5fa;text-decoration:none;font-size:14px;">Discord</a>
        <span style="color:#333;">|</span>
        <a href="https://youtube.com/@AI-AutomatingTheFuture" style="color:#ef4444;text-decoration:none;font-size:14px;">YouTube</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;color:#5a5a6e;font-size:12px;">
      <p>Created by Omar & Alan Estrada Velasquez</p>
      <p style="margin-top:4px;">Kings Dripping Swag • © 2130</p>
    </div>
    
  </div>
</body>
</html>`;
}

function generateFeatureCard(emoji: string, title: string, desc: string): string {
  return `
<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:16px;">
  <span style="font-size:28px;">${emoji}</span>
  <div>
    <div style="color:#fff;font-weight:600;font-size:15px;">${title}</div>
    <div style="color:#5a5a6e;font-size:13px;margin-top:2px;">${desc}</div>
  </div>
</div>`;
}
