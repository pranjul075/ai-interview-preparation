/**
 * resumeTemplate.service.js
 * Professional Single-Page ATS Resume Generator
 * Styled after classic Overleaf / Harvard Tech Resume (Times New Roman serif layout)
 * Automatically distributes content to completely fill one full A4 page without leaving empty space.
 */

function escapeHtml(str) {
    if (!str || typeof str !== "string") return ""
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function isValidText(val) {
    if (!val || typeof val !== "string") return false
    const trimmed = val.trim()
    if (trimmed.length === 0) return false
    const lower = trimmed.toLowerCase()
    return lower !== "n/a" && lower !== "na" && lower !== "none" && lower !== "null" && lower !== "undefined"
}

function cleanArray(arr) {
    if (!Array.isArray(arr)) return []
    return arr.filter(item => {
        if (typeof item === "string") return isValidText(item)
        if (typeof item === "object" && item !== null) return true
        return false
    })
}

function formatUrl(url) {
    if (!isValidText(url)) return ""
    if (!/^https?:\/\//i.test(url)) {
        return "https://" + url
    }
    return url
}

/**
 * Renders structured resume data into an elegant, single-page, ATS-optimized
 * serif layout matching the exact reference typography and alignment.
 * Uses flexbox distribution and adaptive density to guarantee the content
 * takes up the full page completely without spilling onto page 2.
 */
function renderResumeHtml(data = {}) {
    // 1. Header Details
    const fullName = isValidText(data.name) ? escapeHtml(data.name) : "Candidate"
    const location = data.contact && isValidText(data.contact.location) ? escapeHtml(data.contact.location) : ""

    const contactParts = []
    if (data.contact && typeof data.contact === "object") {
        if (isValidText(data.contact.phone)) {
            contactParts.push(escapeHtml(data.contact.phone))
        }
        if (isValidText(data.contact.email)) {
            const email = escapeHtml(data.contact.email)
            contactParts.push(`<a href="mailto:${email}">Email</a>`)
        }
        if (isValidText(data.contact.linkedin)) {
            const lUrl = formatUrl(data.contact.linkedin)
            contactParts.push(`<a href="${escapeHtml(lUrl)}" target="_blank">LinkedIn</a>`)
        }
        if (isValidText(data.contact.github)) {
            const gUrl = formatUrl(data.contact.github)
            contactParts.push(`<a href="${escapeHtml(gUrl)}" target="_blank">GitHub</a>`)
        }
        if (isValidText(data.contact.portfolio)) {
            const pUrl = formatUrl(data.contact.portfolio)
            contactParts.push(`<a href="${escapeHtml(pUrl)}" target="_blank">Portfolio</a>`)
        }
    }

    // 2. Summary / Objective
    const objective = isValidText(data.summary) ? escapeHtml(data.summary) : (isValidText(data.objective) ? escapeHtml(data.objective) : "")

    // 3. Education
    const education = cleanArray(data.education)

    // 4. Skills
    const skills = cleanArray(data.skills)

    // 5. Experience
    const experience = cleanArray(data.experience)

    // 6. Projects
    const projects = cleanArray(data.projects)

    // 7. Certifications & Achievements
    const certifications = cleanArray(data.certifications)
    const achievements = cleanArray(data.achievements)
    const extracurricular = cleanArray(data.extracurricular)

    // 8. Adaptive Density Calibration to fill the entire page height
    const projectBulletsCount = projects.reduce((sum, p) => sum + (cleanArray(p.bullets).length || 1), 0)
    const experienceBulletsCount = experience.reduce((sum, e) => sum + (cleanArray(e.bullets).length || 1), 0)
    const eduCount = education.length
    const skillsCount = skills.length
    const certCount = certifications.length + achievements.length + extracurricular.length

    const totalLines = (objective ? 3 : 0) + (eduCount * 2) + skillsCount + (projectBulletsCount * 1.3) + (experienceBulletsCount * 1.3) + certCount

    let bodySize, lineHeight, nameSize, pageMargin, entryMargin, bulletMargin, titleMargin

    if (totalLines > 26) {
        // Very dense content (e.g. 4 projects with 13 bullets, 3 educations, 7 skills)
        bodySize = "9.3pt"
        lineHeight = "1.28"
        nameSize = "22pt"
        pageMargin = "6.5mm 9mm"
        entryMargin = "3.5pt"
        bulletMargin = "1.6pt"
        titleMargin = "3pt"
    } else if (totalLines >= 17) {
        // Medium content
        bodySize = "9.8pt"
        lineHeight = "1.36"
        nameSize = "24pt"
        pageMargin = "8mm 10mm"
        entryMargin = "4.5pt"
        bulletMargin = "2.4pt"
        titleMargin = "4pt"
    } else {
        // Moderate / Standard content (e.g. 3 projects with 2 bullets, 1 education, 4 skills)
        bodySize = "10pt"
        lineHeight = "1.40"
        nameSize = "26pt"
        pageMargin = "10mm 12mm"
        entryMargin = "6pt"
        bulletMargin = "2.8pt"
        titleMargin = "5pt"
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fullName} - Resume</title>
<style>
  @page {
    size: A4 portrait;
    margin: ${pageMargin};
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: "Times New Roman", Times, "Liberation Serif", Georgia, serif;
    color: #000000;
    background-color: #ffffff;
    font-size: ${bodySize};
    line-height: ${lineHeight};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  /* Full Page Flex Container to distribute content across the entire 1 page */
  .resume-page-container {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  a {
    color: #000000;
    text-decoration: underline;
  }

  .header-container {
    text-align: center;
    margin-bottom: 2pt;
    flex-shrink: 0;
  }

  .name-heading {
    font-size: ${nameSize};
    font-weight: normal;
    color: #000000;
    line-height: 1.1;
    margin-bottom: 3pt;
    letter-spacing: 0.3pt;
  }

  .location-text {
    font-size: 10pt;
    color: #000000;
    line-height: 1.25;
    margin-bottom: 2pt;
  }

  .contact-line {
    font-size: 10pt;
    color: #000000;
    line-height: 1.25;
  }

  .contact-line span + span::before {
    content: " | ";
    color: #000000;
    padding: 0 4pt;
  }

  .section-block {
    flex-shrink: 0;
  }

  .section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
    letter-spacing: 0.5pt;
    border-bottom: 0.75pt solid #000000;
    padding-bottom: 2pt;
    margin-bottom: ${titleMargin};
  }

  .objective-body {
    font-size: 9.8pt;
    line-height: ${lineHeight};
    text-align: justify;
    color: #000000;
  }

  .row-flex {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
  }

  .education-entry {
    margin-bottom: 3pt;
  }

  .education-entry:last-child {
    margin-bottom: 0;
  }

  .edu-degree {
    font-size: 10pt;
    font-weight: bold;
    color: #000000;
  }

  .edu-dates {
    font-size: 9.6pt;
    color: #000000;
    white-space: nowrap;
    text-align: right;
  }

  .edu-college {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
  }

  .edu-gpa {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
    white-space: nowrap;
    text-align: right;
  }

  .skills-list {
    list-style-type: disc;
    margin: 0 0 0 15pt;
    padding: 0;
  }

  .skills-list li {
    font-size: 9.6pt;
    line-height: ${lineHeight};
    margin-bottom: 2.5pt;
    color: #000000;
  }

  .skills-list li:last-child {
    margin-bottom: 0;
  }

  .skills-list b {
    font-weight: bold;
  }

  .project-entry {
    margin-bottom: ${entryMargin};
  }

  .project-entry:last-child {
    margin-bottom: 0;
  }

  .project-title {
    font-size: 10pt;
    font-weight: bold;
    color: #000000;
  }

  .project-date {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
    white-space: nowrap;
    text-align: right;
  }

  .project-tech {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
    line-height: 1.3;
    margin-top: 1pt;
    margin-bottom: 2pt;
  }

  .exp-role {
    font-size: 10pt;
    font-weight: bold;
    color: #000000;
  }

  .exp-date {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
    white-space: nowrap;
    text-align: right;
  }

  .exp-company {
    font-size: 9.6pt;
    font-style: italic;
    color: #000000;
    margin-bottom: 1pt;
  }

  .bullet-list {
    list-style-type: disc;
    margin: 1pt 0 0 15pt;
    padding: 0;
  }

  .bullet-list li {
    font-size: 9.6pt;
    line-height: ${lineHeight};
    color: #000000;
    margin-bottom: ${bulletMargin};
    text-align: justify;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .bullet-list li:last-child {
    margin-bottom: 0;
  }
</style>
</head>
<body>
<div class="resume-page-container">

  <!-- HEADER -->
  <header class="header-container section-block">
    <h1 class="name-heading">${fullName}</h1>
    ${location ? `<div class="location-text">${location}</div>` : ""}
    ${contactParts.length > 0 ? `
    <div class="contact-line">
      ${contactParts.map(item => `<span>${item}</span>`).join("")}
    </div>` : ""}
  </header>

  <!-- CAREER OBJECTIVE -->
  ${objective ? `
  <section class="section-block">
    <div class="section-title">Career Objective</div>
    <div class="objective-body">${objective}</div>
  </section>` : ""}

  <!-- EDUCATION -->
  ${education.length > 0 ? `
  <section class="section-block">
    <div class="section-title">Education</div>
    ${education.map(edu => {
      const institution = isValidText(edu.institution) ? escapeHtml(edu.institution) : ""
      const degree = isValidText(edu.degree) ? escapeHtml(edu.degree) : ""
      const dates = isValidText(edu.dates) ? escapeHtml(edu.dates) : ""
      const gpa = isValidText(edu.gpa) ? escapeHtml(edu.gpa) : ""
      const details = cleanArray(edu.details)

      return `
      <div class="education-entry">
        <div class="row-flex">
          <span class="edu-degree">${degree || institution}</span>
          ${dates ? `<span class="edu-dates">${dates}</span>` : ""}
        </div>
        ${(institution && degree) || gpa ? `
        <div class="row-flex">
          <span class="edu-college">${institution}</span>
          ${gpa ? `<span class="edu-gpa">${gpa}</span>` : ""}
        </div>` : ""}
        ${details.length > 0 ? `
        <ul class="bullet-list" style="margin-top: 1pt;">
          ${details.map(d => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>` : ""}
      </div>`
    }).join("")}
  </section>` : ""}

  <!-- TECHNICAL SKILLS -->
  ${skills.length > 0 ? `
  <section class="section-block">
    <div class="section-title">Technical Skills</div>
    <ul class="skills-list">
      ${skills.map(sk => {
        const cat = isValidText(sk.category) ? escapeHtml(sk.category) : "Skills"
        const items = cleanArray(sk.items)
        if (items.length === 0) return ""
        return `<li><b>${cat}:</b> ${items.map(escapeHtml).join(", ")}</li>`
      }).join("")}
    </ul>
  </section>` : ""}

  <!-- EXPERIENCE (if available) -->
  ${experience.length > 0 ? `
  <section class="section-block">
    <div class="section-title">Experience</div>
    ${experience.map(exp => {
      const role = isValidText(exp.role) ? escapeHtml(exp.role) : "Role"
      const company = isValidText(exp.company) ? escapeHtml(exp.company) : ""
      const expLocation = isValidText(exp.location) ? escapeHtml(exp.location) : ""
      const dates = isValidText(exp.dates) ? escapeHtml(exp.dates) : ""
      const bullets = cleanArray(exp.bullets)

      return `
      <div class="experience-entry section-block">
        <div class="row-flex">
          <span class="exp-role">${role}</span>
          ${dates ? `<span class="exp-date">${dates}</span>` : ""}
        </div>
        ${company || expLocation ? `
        <div class="row-flex">
          <span class="exp-company">${company}${expLocation ? `, ${expLocation}` : ""}</span>
        </div>` : ""}
        ${bullets.length > 0 ? `
        <ul class="bullet-list">
          ${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>` : ""}
      </div>`
    }).join("")}
  </section>` : ""}

  <!-- PROJECTS -->
  ${projects.length > 0 ? `
  <section class="section-block">
    <div class="section-title">Projects</div>
    ${projects.map(proj => {
      const name = isValidText(proj.name) ? escapeHtml(proj.name) : "Project"
      const techStack = isValidText(proj.techStack) ? escapeHtml(proj.techStack) : ""
      const dates = isValidText(proj.dates) ? escapeHtml(proj.dates) : ""
      const bullets = cleanArray(proj.bullets)

      return `
      <div class="project-entry">
        <div class="row-flex">
          <span class="project-title">${name}</span>
          ${dates ? `<span class="project-date">${dates}</span>` : ""}
        </div>
        ${techStack ? `<div class="project-tech">Tech Stack: ${techStack}</div>` : ""}
        ${bullets.length > 0 ? `
        <ul class="bullet-list">
          ${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>` : ""}
      </div>`
    }).join("")}
  </section>` : ""}

  <!-- CERTIFICATIONS & ACHIEVEMENTS -->
  ${(certifications.length > 0 || achievements.length > 0 || extracurricular.length > 0) ? `
  <section class="section-block">
    <div class="section-title">Certifications &amp; Achievements</div>
    <ul class="bullet-list">
      ${certifications.map(cert => {
        const name = isValidText(cert.name) ? escapeHtml(cert.name) : ""
        const issuer = isValidText(cert.issuer) ? escapeHtml(cert.issuer) : ""
        const link = isValidText(cert.url) ? formatUrl(cert.url) : (isValidText(cert.link) ? formatUrl(cert.link) : "")
        if (!name) return ""
        return `<li><b>${name}${issuer ? ` (${issuer})` : ""}:</b> ${link ? `<a href="${escapeHtml(link)}" target="_blank">View Certificate</a>` : "View Certificate"}</li>`
      }).join("")}
      ${achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join("")}
      ${extracurricular.map(act => `<li>${escapeHtml(act)}</li>`).join("")}
    </ul>
  </section>` : ""}

</div>
</body>
</html>`
}

module.exports = {
    renderResumeHtml,
    escapeHtml,
    isValidText
}
