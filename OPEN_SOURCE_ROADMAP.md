# Open Source Roadmap and Evidence

Last reviewed: 2026-11-23.

This document distinguishes code shipped in the repository from adoption and maintenance evidence that is **not yet established**.

## 1. Immediate reliability and honesty
- [x] Add MIT license, CONTRIBUTING, SECURITY, and GitHub issue/PR templates.
- [x] Add initial Node + TypeScript CI definition and unit tests.
- [x] Replace mock browser OCR with a Tesseract.js implementation (needs CI and manual verification).
- [x] Prevent fake paid subscription activation in the browser demo.
- [x] Remove misleading web Face ID and passcode security promises.
- [x] Explicitly limit image import instead of implying PDF import.
- [ ] Verify the GitHub Actions checks pass and test OCR using synthetic images in a browser.
- [ ] Document supported browsers and accessibility testing.
- [ ] Remove remaining simulated capabilities or clearly label each one.
- [ ] Add reproducible dependency lockfile; pin CI dependencies.
- [ ] Review dependencies and supply a security disclosure contact.

## 2. Product milestones
- [ ] Real document boundary detection (current browser overlay may be simulated).
- [ ] PDF import/rendering and accurate PDF merger and splitter, not only app-internal page operations.
- [ ] Test coverage for image enhancement, OCR error states, PDF output, and storage.
- [ ] Browser IndexedDB storage with clear capacity/error handling.
- [ ] Optional native iOS implementation, separately built and validated.
- [ ] Appropriate data protection prior to processing sensitive data.

## 3. Community maintenance evidence
To assess open-source grant eligibility, gather **real data**:
- Public commits/releases, substantive code review, and issue triage
- Unique external contributors and their merged PRs
- Stars, forks, dependable install/download counts if available
- Independent usage and integration reports from other maintainers
- Security review and ongoing maintenance responsibilities

No downloads, users, external contributors, or merged PR counts are asserted here without a verifiable source. Creating a repository is not the same as demonstrating ecosystem reliance.

## 4. Grant application readiness
- **OpenAI Codex for Open Source** emphasizes maintenance of active, meaningful, broadly used or important OSS.
- **Anthropic Claude for Open Source** has thresholds including 100 merged outside-repository PRs in 12 months, 20 external contributors with merged PRs, adoption thresholds, or critical infrastructure status. Exceptional community-reliant projects can still explain their importance.
- **Current status:** Eligibility not yet demonstrated. Do not claim qualification or a granted subscription.

The maintainer should review the official terms before applying and provide their own accurate account identifiers and contact details.
