const FORM_URL = "https://formspree.io/f/YOUR_FORM_ID";

function $(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = $(id);
  return el ? el.value.trim() : "";
}

async function postToFormspree(payload) {
  if (!FORM_URL || FORM_URL.includes("YOUR_FORM_ID")) return { skipped: true };

  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));

  const res = await fetch(FORM_URL, {
    method: "POST",
    body: fd,
    headers: { Accept: "application/json" },
  });

  return { ok: res.ok };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = $("submit-form");
  const errorEl = $("submit-error");
  const button = $("submit-button");
  const successWrap = $("submit-success");
  const formWrap = $("submit-form-wrap");
  if (!form || !errorEl || !button || !successWrap || !formWrap) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    button.disabled = true;
    button.textContent = "Submitting...";

    const resourcePayload = {
      name: getValue("field-name"),
      category: getValue("field-category"),
      description: getValue("field-description"),
      address: getValue("field-address") || null,
      website: getValue("field-website") || null,
      phone: getValue("field-phone") || null,
    };

    const submitterPayload = {
      submitter_name: getValue("field-submitter-name") || null,
      submitter_email: getValue("field-submitter-email") || null,
      // Include the resource fields too so admins can reconcile quickly.
      ...resourcePayload,
    };

    // Basic client-side validation (DB constraints + required HTML attributes).
    if (!resourcePayload.name || !resourcePayload.category || !resourcePayload.description) {
      errorEl.textContent = "Please complete the required fields.";
      button.disabled = false;
      button.textContent = "Submit Resource";
      return;
    }

    try {
      await submitResource(resourcePayload);

      // Backup notification is best-effort.
      postToFormspree(submitterPayload).catch((err) => {
        console.error("Formspree backup failed:", err);
      });

      formWrap.hidden = true;
      successWrap.hidden = false;
    } catch (err) {
      console.error(err);
      errorEl.textContent = err?.message || "Something went wrong. Please try again.";
      button.disabled = false;
      button.textContent = "Submit Resource";
    }
  });
});

