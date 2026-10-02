# Kitchen sink: job application

A shared renderer example with English and Bulgarian authoring catalogs.
Register base and extended renderers **and cells**, including AG Grid and Monaco.
Load the matching renderer locale for built-in actions, pagination and dialogs.
Use the demo language selector to switch locale.

## Coverage

- Identity: text, email, URI, international phone pattern, password, OTP and multiline text.
- Contact: object, oneOf branch selection, anyOf alternatives and allOf composition.
- Preferences: enum dropdown, radio, checkbox, toggle, integer, decimal, slider and color.
- Scheduling: date, time, date-time, duration and cron.
- Collections: normal table and AG Grid with seven rows, three per page, nested
  object/array cell dialogs, row details, list/detail, string array, additional
  properties and a tuple.
- Advanced: mixed data, a text attachment and a bounded JSON editor.
- Category validation markers, localized validation messages and translated field labels.

## Validation walkthrough

`data.json` starts valid. Replace the demo data with `invalid-data.json` to show
10 deliberately invalid paths, including errors on page two in each table.
Correct email addresses, international phone syntax, OTP length, numeric bounds,
date syntax, an empty city and an empty company name. Row, cell and category
indicators should clear as their corresponding errors are fixed.

Phone numbers must match `^\+[1-9][0-9]{7,14}$`: a leading plus and 8–15 digits.
This checks a deliberately restricted international syntax, not country-specific
numbering plans, number assignment or reachability. Email validation uses the
standard JSON Schema email format; it does not prove mailbox ownership.
Postal codes use a permissive international pattern, not a country-specific validator.
Password rules are demonstration constraints, not a password security policy.

The host must enable standard format validation (for example Ajv plus ajv-formats).
Password/color/cron are renderer formats; this fixture does not claim that a
standard JSON Schema validator understands those custom formats. JSON editor
syntax feedback requires Monaco's language service and is distinct from schema validation.

## Limits

This example uses components shared by both families. Chips and multi-select array variants are also available in both renderer families.
It does not require remote services, submit handlers, $dynamic overlays or timezone
conversion. Values and free-form user data are not translated. Native library
strings require the host's component-library locale as well as the fixture catalog.

Combinator branches declare their own object type and editable properties.
A required-only branch is avoided because it gives the generated branch editor
no fields to render. First and last names are strings of 1–80 characters; only
the advanced Payload field intentionally uses a mixed-type editor.

## Phone input guidance

The main phone field and table row-detail phone editors request masks for
8–15 digits prefixed with `+`. `returnMaskedValue: true` preserves that plus in
storage, matching the schema pattern. The example placeholder is
`+442079460123`; translated descriptions explain the country code and length.
Renderer implementations should provide the mask behavior described above. Inline table cells keep their existing editors.

## Domain and source inspiration

This is a job-application example. See the [implementation notes](../../docs/implementation-web-typescript.md#example-provenance) for source inspiration and adaptation details.
The stable catalog ID remains `kitchen-sink` to preserve existing demo links.
Future domain examples should use their own IDs and domain-qualified titles.

Résumé and documents and Technical work sample now have separate visible tabs.
The two reference tables demonstrate alternative editors over separate sample
collections. Integration metadata is an optional administrative extension,
not an applicant name field. This remains a component demonstration; no submission
or real recruitment backend is connected.

### Usable detail dialogs

The example config enables dragging, resizing and maximizing for row and complex-cell dialogs through `jsonformsExtended.dialog`. Phone fields in the applicant and reference-row forms use international phone masks; validation still checks syntax. Open References: table and References: AG Grid row editors: the header and action buttons must remain within the viewport while the form body scrolls.

### Navigation

Four steps (Profile, Job, References, Finish) use the existing stepper with localized Next/Previous actions and direct step selection. Each step contains two to four related tabs. All eleven original sections remain available, with category validation indicators retained at both levels. Navigation does not submit or discard data. Check both English and Bulgarian labels and navigate away from and back to edited fields.

### Horizontal sizing in the form

Profile → Applicant and account uses 6/10 spans for first/last name, 2:1 weights for email/phone, and a flexible password beside a fixed 220px verification-code field. Job → Job preferences uses 2:1 weights for position/department and a fixed 140px age field beside a flexible budget. These rows wrap at their minimum widths and inherit the portable gap. Existing masks, labels and translations are preserved. Narrow the form with the demo splitter to inspect wrapping.

### Presentation elements

Finish → Résumé and documents includes a decorative ImageView with an embedded SVG data URL and empty alt, a translated Markdown Label, a horizontal Separator (divider), an explicit 24px Spacer before the help section, and a translated mailto Link. The recruitment address is illustrative. These elements preserve form data and use the normal image/link URL policy.
