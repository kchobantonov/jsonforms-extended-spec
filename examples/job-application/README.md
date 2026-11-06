# Job application

A nested application form kept alongside the broader kitchen-sink journey. It
exercises applicant details, skills, experience, preferences, agreements,
resumes, and references in one realistic record. The authored buttons request
locale changes and theme changes, so hosts must supply those action handlers.

`uischema.json` and the named forms in `uischemas.json` are portable. The
generated example export includes that registry, so hosts can render the
applicant, address, and position templates without per-framework adapters.
The applicant template gives the picture and file picker one share of the row
and the input fields three shares; minimum widths let the columns wrap when
space is limited.

The sample profile picture is an inline PNG. `config.json` opts into image data
URLs so hosts can display that picture under the URL policy.

The English and Bulgarian catalogs group `static-text` and field labels as nested
JSON objects. Hosts resolve dotted keys through those objects while preserving
literal dotted-key precedence (see [internationalization](../../docs/spec.md#98-renderer-owned-strings)).
