# Level Up Accessibility Agency — Website

A production-ready, WCAG 2.2 AA compliant agency portfolio and client acquisition funnel for **Level Up**, a web accessibility consultancy.

---

## Predicted Lighthouse Scores

| Category        | Score  | Notes                                                    |
|-----------------|--------|----------------------------------------------------------|
| **Performance** | 95–98  | Static HTML, Google Fonts with display=swap, lazy images |
| **Accessibility**| **97–100** | Semantic HTML, ARIA only where needed, AA+ contrast  |
| **Best Practices**| 95–100 | HTTPS, no mixed content, modern APIs                 |
| **SEO**         | 97–100 | Meta tags, Open Graph, structured data, canonical URL   |

> Run your own test: `npx lighthouse https://yoursite.com --view`

---

## Project Structure

```
levelup/
├── index.html                   # Main single-page site
├── README.md                    # This file
├── assets/
│   ├── css/
│   │   └── styles.css           # All styles — mobile-first, CSS custom properties
│   ├── js/
│   │   └── main.js              # All JS — accessible interactions, form validation
│   └── images/
│       ├── logo.png             # Brand logo (1024×1024)
│       ├── favicon.ico          # Generated from logo
│       ├── favicon-32.png       # PNG favicon
│       └── apple-touch-icon.png # 180×180 iOS icon
```

---

## Local Development

### Option 1: Python (built-in)

```bash
cd levelup
python3 -m http.server 8080
# Visit: http://localhost:8080
```

### Option 2: Node.js http-server

```bash
npm install -g http-server
cd levelup
http-server -p 8080
# Visit: http://localhost:8080
```

### Option 3: VS Code Live Server

Install the **Live Server** extension, right-click `index.html` → "Open with Live Server".

---

## Deploy to GitHub Pages

1. Create a GitHub repository (e.g. `levelup-website`)
2. Push the project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/levelup-website.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` → Folder: `/ (root)`
4. Site will be live at `https://YOUR_USERNAME.github.io/levelup-website/`

> **Tip:** Update `<link rel="canonical">` in `index.html` to your live URL before pushing.

---

## Accessibility Testing Workflow

### 1. Automated: Lighthouse (Chrome DevTools)

```bash
# CLI (requires Node.js)
npm install -g lighthouse
lighthouse http://localhost:8080 --view --only-categories=accessibility

# Or in Chrome DevTools:
# DevTools → Lighthouse → Accessibility → Analyze page load
```

**Target:** 95+ (aim for 100)

---

### 2. Automated: axe DevTools

**Browser extension (free):**
1. Install [axe DevTools](https://www.deque.com/axe/devtools/) for Chrome or Firefox
2. Open DevTools → axe tab
3. Click "Scan ALL of my page"
4. Review: 0 violations is the target

**axe-core CLI:**
```bash
npm install -g @axe-core/cli
axe http://localhost:8080
```

---

### 3. Automated: WAVE

1. Install [WAVE Browser Extension](https://wave.webaim.org/extension/)
2. Visit `http://localhost:8080`
3. Click WAVE icon
4. Check: 0 Errors, 0 Contrast Errors
5. Review Alerts and Structural elements

**Or use the online tool:** [wave.webaim.org](https://wave.webaim.org) (once deployed)

---

### 4. Screen Reader Testing

#### VoiceOver (macOS / iOS)

```
Enable:  Cmd + F5  (macOS) or Settings → Accessibility → VoiceOver (iOS)
Navigate: VO (Ctrl+Opt) + Right/Left arrows through content
Headings: VO + Cmd + H  to jump between headings
Links:    VO + Cmd + L  to navigate links
Forms:    VO + Cmd + J  for form controls
Rotor:    VO + U        (landmark navigation wheel)
```

**Test checklist:**
- [ ] Skip link announced and functional on Tab
- [ ] Page title announced when page loads
- [ ] All images have meaningful alt text (or decorative marked as empty)
- [ ] Nav landmark announced as "navigation"
- [ ] Heading hierarchy makes sense (h1 → h2 → h3)
- [ ] Form labels read before input type
- [ ] Error messages announced immediately on invalid submit
- [ ] Success message announced without screen jumping
- [ ] Tabs respond to arrow keys
- [ ] Modal/panels announce role

#### NVDA (Windows — free)

```
Download: nvaccess.org/download
Enable:   Installed app — starts automatically
Navigate: Tab through interactive elements
Browse:   Arrow keys through all content
Headings: H key
Landmarks: D key
Links:    K key
```

#### JAWS (Windows — commercial, 40-min free sessions)

```
Download: freedomscientific.com
Test:     Same checklist as NVDA
```

---

### 5. Manual Keyboard Navigation Checklist

Open your site in any browser. Put your mouse away. Test only with keyboard.

#### Navigation & Focus
- [ ] Press **Tab** — does a skip link appear? Does it work?
- [ ] Tab through entire page — focus indicator visible at all times?
- [ ] Focus never disappears or gets trapped unexpectedly
- [ ] Logical focus order follows visual layout (left→right, top→bottom)
- [ ] **Shift+Tab** moves backward through focusable elements

#### Navigation Menu (mobile breakpoint)
- [ ] Tab to hamburger button — visible focus ring
- [ ] **Enter** or **Space** opens menu
- [ ] **Escape** closes menu and returns focus to button
- [ ] Tab through menu links — all reachable
- [ ] Clicking a link closes menu and navigates correctly

#### Tab Widget (Portfolio section)
- [ ] Tab to first tab — focus visible
- [ ] **Arrow Right/Left** moves between tabs, panel updates
- [ ] **Home** → first tab, **End** → last tab
- [ ] **Tab** from tab → moves into active panel

#### Form (Audit section)
- [ ] All fields reachable via Tab
- [ ] Labels clearly associated (VO reads "Your name, text field")
- [ ] Submit with empty fields → errors announced, focus moves to first error
- [ ] Fill form correctly → submit → success message announced

#### Sticky CTA
- [ ] Dismiss button reachable via Tab when visible
- [ ] Focus ring visible on dismiss button
- [ ] Dismiss → bar disappears cleanly

#### General
- [ ] All buttons/links activate with **Enter** key
- [ ] Buttons additionally activate with **Space** key
- [ ] No content requires hover to be accessible
- [ ] Color is never the only means of conveying information

---

## WCAG AAA Improvement Suggestions

The site currently achieves WCAG 2.2 AA. The following additions would bring specific sections to **Level AAA**:

| Criterion | ID | Current | AAA Improvement |
|---|---|---|---|
| Contrast Enhanced | 1.4.6 | AA (4.5:1) | Increase body text contrast to 7:1 |
| Focus Appearance | 2.4.11 | AA | Upgrade focus ring to 3px, perimeter ≥ width×height |
| Pointer Cancellation | 2.5.2 | AA | Ensure all actions trigger on `mouseup`, not `mousedown` |
| Status Messages | 4.1.3 | AA | Already implemented |
| Animation from Interactions | 2.3.3 | Supported | Already implemented (prefers-reduced-motion) |
| Reading Level | 3.1.5 | N/A | Provide plain-language summaries (lower secondary level) |
| Link Purpose in Context | 2.4.9 | AA | Ensure every link has purpose from link text alone (no "click here") |

---

## Future Scaling Ideas

### Technical
- **Component library:** Extract CSS custom properties + BEM components into a shared Figma/Storybook system
- **CMS integration:** Connect Netlify CMS or Sanity for blog/case study management
- **i18n:** Add `<html lang>` per page and translated content for French/Spanish markets
- **A/B testing:** Test CTA copy variants ("Free Audit" vs "Check My Site") with analytics
- **Accessibility overlay API:** Live score badge pulled from monitoring API

### Content
- **Blog/resources:** WCAG explainers, legal news, tooling guides — excellent for SEO
- **Pricing page:** Tiered pricing with clear feature matrix for self-serve vs enterprise
- **Webinar/events:** Accessibility training signup integrated with calendar API
- **Feedback widget:** "Report an accessibility problem" persistent button (WCAG commitment)

### Business
- **Automated audit tool:** Light self-serve scan with email report to feed top of funnel
- **Compliance tracker dashboard:** Client portal to view ongoing monitoring scores
- **Referral programme:** Agency white-label partnerships

---

## Accessibility Statement

This site is committed to WCAG 2.2 Level AA conformance.  
Report issues: [accessibility@levelupaccessibility.com](mailto:accessibility@levelupaccessibility.com)  
Last audited: 2025

---

## License

MIT — use freely for client projects, with attribution appreciated.
