/* Login screen — left brand panel + right form with role picker */
const LoginScreen = ({ onLogin, initialStep = 'login' }) => {
  const [email, setEmail] = React.useState('priya.anand@northfield.edu');
  const [showPassword, setShowPassword] = React.useState(false);
  const [step, setStep] = React.useState(initialStep); // login | signup | 2fa-setup | 2fa
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef([]);

  // Generate deterministic-looking backup codes (one-time, on first 2FA setup)
  const [backupCodes] = React.useState(() => {
    const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, 'X');
    return Array.from({ length: 10 }, () => `${seg()}-${seg()}`);
  });
  const [secret] = React.useState('JBSWY3DPEHPK3PXP4FZA7QXM');
  const [codesSaved, setCodesSaved] = React.useState(false);
  const [copiedSecret, setCopiedSecret] = React.useState(false);
  const [pendingRole, setPendingRole] = React.useState('parent');

  // Signup state
  const [su, setSu] = React.useState({ firstName: '', lastName: '', email: '', password: '' });
  const [agree, setAgree] = React.useState(true);
  const [pwStrength, setPwStrength] = React.useState(0);

  const updateSu = (k, v) => {
    const next = { ...su, [k]: v };
    setSu(next);
    if (k === 'password') {
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      setPwStrength(s);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!agree) return;
    // First-time accounts: route through 2FA setup before entering the portal
    setPendingRole('parent');
    setStep('2fa-setup');
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([
      `Northfield Academy — 2FA backup codes\n`,
      `Account: ${su.email || email}\n`,
      `Generated: ${new Date().toLocaleString()}\n`,
      `\nKeep these codes somewhere safe. Each code can be used once if you lose access to your authenticator.\n\n`,
      backupCodes.map((c, i) => `${String(i+1).padStart(2,'0')}.  ${c}`).join('\n'),
      `\n\n— Do not share these codes —\n`,
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'northfield-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setCodesSaved(true);
  };

  const handleCopySecret = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(secret).catch(()=>{});
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 1600);
  };

  // Infer role from email prefix (admin/hod require 2FA)
  const inferRole = (em) => {
    const e = (em || '').toLowerCase();
    if (e.includes('admin') || e.startsWith('priya')) return 'admin';
    if (e.includes('hod')) return 'hod';
    if (e.includes('parent') || e.includes('family')) return 'parent';
    if (e.includes('student') || /\bnk-/.test(e)) return 'student';
    return 'teacher';
  };
  const selectedRole = inferRole(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPendingRole(selectedRole);
    // Every account uses 2FA at sign-in
    setStep('2fa');
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i+1]?.focus();
    if (next.every(d => d !== '')) {
      setTimeout(() => onLogin(pendingRole || selectedRole), 400);
    }
  };

  return (
    <div className="sms-login">
      {/* Left — brand panel */}
      <div className="sms-login-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sms-brand-mark" style={{ width: 40, height: 40, fontSize: 17 }}>NA</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{SCHOOL.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{SCHOOL.tagline}</div>
          </div>
        </div>

        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 14 }}>One platform for the whole school</div>
          <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            Less paperwork.<br/>More <span style={{ background: 'linear-gradient(90deg, #6ee7b7, #99f6e4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>teaching.</span>
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.78, marginTop: 16 }}>
            Attendance, timetables, quizzes, fees, and parent communication — all in one calm, friendly place.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 26 }}>
            <div className="sms-tile">
              <div style={{ fontSize: 22, fontWeight: 700 }}>1,284</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Students enrolled</div>
            </div>
            <div className="sms-tile">
              <div style={{ fontSize: 22, fontWeight: 700 }}>96.4%</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Avg. attendance</div>
            </div>
            <div className="sms-tile">
              <div style={{ fontSize: 22, fontWeight: 700 }}>87</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Teachers & staff</div>
            </div>
            <div className="sms-tile">
              <div style={{ fontSize: 22, fontWeight: 700 }}>12</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Departments</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, opacity: 0.75 }}>
          <IconShield size={14} />
          <span>Secured with 2FA · ISO 27001 compliant · Data hosted in India</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="sms-login-right">
        {step === 'login' && (
          <div className="sms-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Welcome back</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 4 }}>Sign in to continue to your portal.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="sms-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <IconMail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    className="sms-input"
                    style={{ paddingLeft: 36 }}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@northfield.edu"
                  />
                </div>
              </div>

              <div>
                <label className="sms-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <IconLock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    className="sms-input"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 6, color: 'var(--text-3)' }}>
                    <IconEye size={15} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-600)' }} />
                  Keep me signed in
                </label>
                <a style={{ color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer' }}>Forgot password?</a>
              </div>

              <button type="submit" className="sms-btn sms-btn-primary sms-btn-lg" style={{ justifyContent: 'center', marginTop: 4 }}>
                Sign in
                <IconChevronRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)' }}>
              Don't have an account? <a onClick={() => setStep('signup')} style={{ color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer' }}>Create one</a>
            </div>
          </div>
        )}

        {step === 'signup' && (
          <div className="sms-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Create your account</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 4 }}>Join Northfield Academy in under a minute.</p>
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="sms-label">First name</label>
                  <div style={{ position: 'relative' }}>
                    <IconUser size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                    <input
                      className="sms-input"
                      style={{ paddingLeft: 36 }}
                      type="text"
                      value={su.firstName}
                      onChange={e => updateSu('firstName', e.target.value)}
                      placeholder="Sanjay"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="sms-label">Last name</label>
                  <input
                    className="sms-input"
                    type="text"
                    value={su.lastName}
                    onChange={e => updateSu('lastName', e.target.value)}
                    placeholder="Kapoor"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="sms-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <IconMail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    className="sms-input"
                    style={{ paddingLeft: 36 }}
                    type="email"
                    value={su.email}
                    onChange={e => updateSu('email', e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="sms-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <IconLock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input
                    className="sms-input"
                    style={{ paddingLeft: 36, paddingRight: 36 }}
                    type={showPassword ? 'text' : 'password'}
                    value={su.password}
                    onChange={e => updateSu('password', e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 6, color: 'var(--text-3)' }}>
                    <IconEye size={15} />
                  </button>
                </div>
                {/* Strength meter */}
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  {[0,1,2,3].map(i => {
                    const colors = ['var(--rose-500)', 'var(--amber-500)', 'var(--amber-500)', 'var(--brand-500)'];
                    const filled = i < pwStrength;
                    return <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: filled ? colors[pwStrength-1] : 'var(--surface-3)' }} />;
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>
                  {pwStrength === 0 && '8+ characters with uppercase, number, and symbol'}
                  {pwStrength === 1 && 'Weak — add an uppercase letter'}
                  {pwStrength === 2 && 'Fair — add a number'}
                  {pwStrength === 3 && 'Good — add a symbol for stronger'}
                  {pwStrength === 4 && <span style={{ color: 'var(--brand-700)' }}>Strong password</span>}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer', lineHeight: 1.5 }}>
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ accentColor: 'var(--brand-600)', marginTop: 2 }} />
                <span>I agree to the <a style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Terms of Service</a> and <a style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Privacy Policy</a>.</span>
              </label>

              <button type="submit" className="sms-btn sms-btn-primary sms-btn-lg" style={{ justifyContent: 'center', marginTop: 4, opacity: agree ? 1 : 0.5 }} disabled={!agree}>
                Create account
                <IconChevronRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text-3)' }}>
              Already have an account? <a onClick={() => setStep('login')} style={{ color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer' }}>Sign in</a>
            </div>
          </div>
        )}

        {step === '2fa-setup' && (
          <div className="sms-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
              <span style={{ width: 18, height: 18, borderRadius: 99, background: 'var(--brand-500)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>1</span>
              Account created
              <span style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 6px' }} />
              <span style={{ width: 18, height: 18, borderRadius: 99, background: 'var(--brand-500)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>2</span>
              <b style={{ color: 'var(--text)' }}>Set up 2FA</b>
              <span style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 6px' }} />
              <span style={{ width: 18, height: 18, borderRadius: 99, background: 'var(--surface-3)', color: 'var(--text-3)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>3</span>
              Done
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'grid', placeItems: 'center' }}>
                  <IconShield size={18} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Secure your account</h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                Scan the QR with Google Authenticator, Authy, or 1Password. Then save your backup codes.
              </p>
            </div>

            {/* QR + secret */}
            <div style={{ display: 'flex', gap: 14, padding: 14, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface-2)' }}>
              <div style={{ width: 108, height: 108, padding: 8, background: 'white', borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 50 50" width="92" height="92">
                  {Array.from({ length: 25*25 }).map((_, i) => {
                    const x = i % 25, y = Math.floor(i / 25);
                    const v = (x*7 + y*13 + (x^y)*3 + (x*y)%5) % 5;
                    if (v > 2) return null;
                    return <rect key={i} x={x*2} y={y*2} width={2} height={2} fill="#0a1410" />;
                  })}
                  {[[0,0],[36,0],[0,36]].map(([fx, fy], i) => (
                    <g key={i}>
                      <rect x={fx} y={fy} width="14" height="14" fill="#0a1410" />
                      <rect x={fx+2} y={fy+2} width="10" height="10" fill="white" />
                      <rect x={fx+4} y={fy+4} width="6" height="6" fill="#0a1410" />
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Or enter manually</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginTop: 6, wordBreak: 'break-all', lineHeight: 1.4 }}>
                  {secret.match(/.{1,4}/g).join(' ')}
                </div>
                <button type="button" onClick={handleCopySecret} className="sms-btn sms-btn-secondary sms-btn-sm" style={{ marginTop: 10 }}>
                  {copiedSecret ? <><IconCheck size={12} /> Copied</> : <><IconFileText size={12} /> Copy secret</>}
                </button>
              </div>
            </div>

            {/* Backup codes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Backup codes</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>One-time codes for if you lose your device</div>
                </div>
                <span className="sms-pill sms-pill-amber" style={{ fontSize: 10 }}>Keep safe</span>
              </div>
              <div style={{ padding: 14, border: '1px dashed var(--border)', borderRadius: 12, background: 'var(--surface)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
                {backupCodes.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
                    <span style={{ color: 'var(--text-3)', fontSize: 10, minWidth: 16 }}>{String(i+1).padStart(2,'0')}</span>
                    {c}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="button" onClick={handleDownloadCodes} className="sms-btn sms-btn-secondary sms-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <IconDownload size={13} /> Download .txt
                </button>
                <button type="button" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(backupCodes.join('\n')).catch(()=>{}); setCodesSaved(true); }} className="sms-btn sms-btn-secondary sms-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <IconFileText size={13} /> Copy all
                </button>
                <button type="button" onClick={() => window.print()} className="sms-btn sms-btn-secondary sms-btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <IconFileText size={13} /> Print
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={codesSaved} onChange={e => setCodesSaved(e.target.checked)} style={{ accentColor: 'var(--brand-600)', marginTop: 2 }} />
              <span>I've saved my backup codes somewhere safe.</span>
            </label>

            <button onClick={() => setStep('2fa')} className="sms-btn sms-btn-primary sms-btn-lg" style={{ justifyContent: 'center', opacity: codesSaved ? 1 : 0.5 }} disabled={!codesSaved}>
              Continue to verification
              <IconChevronRight size={16} />
            </button>
          </div>
        )}

        {step === '2fa' && (
          <div className="sms-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <button onClick={() => setStep('login')} className="sms-btn sms-btn-ghost" style={{ alignSelf: 'flex-start', padding: '4px 8px' }}>
              <IconChevronLeft size={14} /> Back
            </button>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--brand-50)', color: 'var(--brand-700)', display: 'grid', placeItems: 'center' }}>
              <IconShield size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Two-factor verification</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 4 }}>
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  className="sms-input"
                  style={{ width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
              Didn't get a code? <a style={{ color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer' }}>Send via SMS</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
