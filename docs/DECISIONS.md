# Design decisions

This document explains the main choices behind product-matcher, what I traded off, and what I would change with more time. The code is the source of truth. This is the reasoning behind it.

## What the app does

A hospital buyer picks one of their articles. The system finds candidate products in the supplier catalogs and assesses, attribute by attribute, whether each candidate is equivalent. Where the catalog doesn't say something (in the sample data, typically the MDR class), the buyer sends a question to that supplier. The supplier answers, the answer becomes part of their catalog data, and the buyer re-runs the assessment to see the updated result, for example 80% → 100%.

Everything in the app serves that loop. I removed anything that didn't, including an audit timeline, search and status tabs I had in an earlier version, because they made the core flow harder to see.

## Stack

- **Client:** React 19, TypeScript, Vite, Ant Design.
- **Service:** Node.js with TypeScript, using the built-in `http` module and `fetch`. No web framework, no ORM.
- **LLM access:** through a LiteLLM gateway (more below).

I kept the client and the API as two separate workspaces, because the boundary between hospital-side and supplier-side endpoints is part of the design, and it is easier to show and explain as a plain REST API than as server components. The service has only a handful of routes, so a framework would have added more code than it saved.

## Getting the data in

The hospital master data comes from `sample-challenge-v01.xlsx` (10 articles). The supplier data comes from two real catalogs: B. Braun (`product_catalog_01.pdf`) and BD (`product_catalog_02.pdf`). Both cover syringes and needles, so only two hospital articles, the 10 ml Luer-Lock syringe (#3) and the 0.8 × 40 mm needle (#6), have candidates at all.

I chose a **one-time preprocessing step** over in-app upload. Extracting from a long product catalog is slow and doesn't need to happen while a buyer waits, and a fixed seed makes the demo reproducible: every reviewer sees the same starting data. Upload can be added later on top of the same data model.

To be transparent: for this version, I prepared the seed (`service/src/data/seed.ts`) **by hand**, not with a script. Two details matter:

- Catalog values are copied **as written in the PDFs**, for example "BD Luer-Lok™-Ansatz", "Packung zu 100 Stück", "VE 100 / UK 400". I deliberately didn't clean them up, because judging that kind of wording is exactly the LLM's job.
- The hospital's requirements per attribute (volume 10 ml, Luer-Lock, sterile, pack of 100, MDR class IIa) are what an extraction step would derive from the article name and master data. I wrote them down manually.

None of the catalogs state an MDR class. To show a complete match without running the loop first, the seed contains one **already answered supplier question**: B. Braun confirming class IIa for the Sterican needle. It's stored like any other answer, so its origin is visible in the data.

The next step here would be a small script that parses the xlsx and extracts catalog attributes with the LLM into the same seed format.

## Matching and what "equivalent" means

A product is a candidate for an article if it is in the **same category** (syringe, needle, and so on). It's simple and explainable, and it means a new syringe in a catalog shows up for every syringe article without any manual linking.

Each category has a **fixed list of attributes** that decide equivalence. For syringes that's volume, connector, sterility, pack size and MDR class. I considered letting the LLM decide which attributes matter, but rejected it:

- Results would differ between runs. That conflicts with "re-run to see the updated result": you can't tell whether a score changed because of new data or because the model chose differently.
- Scores of two candidates for the same article wouldn't be comparable.
- Questions to suppliers would no longer map to a known attribute, so answers couldn't be stored as structured data.

The cost is that someone has to define a list per category. With two categories in the sample data, that's a fair price.

**Manufacturer is not part of the list.** Finding a BD syringe that can replace a B. Braun one is the whole point of the exercise. If a hospital ever needs to lock an article to one brand, that would be a flag on the article, not a change to the assessment.

## How an assessment works

This is the part I spent the most time on. The rule is: **code decides everything that has a clear answer, and the LLM only judges what needs judgement.**

For each attribute in the category's list (`service/src/assessment/assessment.ts`):

1. **Supplier value missing →** `MISSING`, decided in code.
2. **Values identical** (ignoring case and spacing) **→** `MATCH`, decided in code.
3. **Coded attribute** (currently the MDR class, with fixed options I, IIa, IIb, III) **→** exact comparison in code. A different code is a `MISMATCH`.
4. **Everything else →** the LLM decides `MATCH` or `MISMATCH`, with a short reasoning in English and German.

The verdict and score are then computed in code from these per-attribute results:

- **Verdict:** any mismatch → *not equivalent*; otherwise any missing value → *needs info*; otherwise *equivalent*.
- **Score:** the share of matching attributes.

The LLM never produces the verdict itself, so the outcome stays traceable to individual attributes.

I tested the LLM step against a deliberately small local model (Qwen 2.5, 1.5B parameters), because a weak model exposes problems that a strong one hides. Each problem I found led to one of the rules in the current design:

- **The model returned the wrong JSON shape.** Requests now include a JSON schema, so the model is constrained to the exact format, and the service still validates every answer.
- **It decided first and explained afterwards, and contradicted itself.** It wrote "5 ml is less than the required 10 ml" and then answered MATCH. The schema now puts the reasoning *before* the status, so the model explains first and decides second.
- **When asked about several attributes at once, it stopped after the first one.** Each attribute is now a separate call, all running in parallel. A single answer can't skip anything, and the total time stays the same.
- **It misread catalog abbreviations.** It took "VE 100 / UK 400" to mean 400 pieces. The prompt now includes the abbreviations the BD catalog itself uses (VE = sales unit, UK = outer carton).
- **It judged values it had misread.** The model must now quote both values first, and the service checks the quotes against what it actually sent; a misquote rejects the answer. This is what stops a model from claiming that "both say IIa" when the supplier wrote something else.
- **It reasoned correctly about IIa vs IIb and still answered MATCH.** That is why coded values are compared in code and offered as a dropdown to the supplier. It's not a question for the LLM at all.

Assessments run when the buyer clicks **"Run assessment"**, not automatically on startup. That avoids hidden LLM costs, and it makes the LLM step a visible part of the demo.

## Questions and answers

Questions are created per **missing attribute of a product**, not per hospital article. An answer describes the supplier's product, so once BD has stated the MDR class of the Plastipak syringe, it applies to every hospital article that product is a candidate for.

Answers are written straight into the product's attributes, so the supplier's catalog actually gets better over time instead of the answer living in a side channel. Coded attributes only accept their fixed values; anything else is rejected by the API.

The question text itself isn't stored. It's rendered from a template in the user's language, so a German-speaking supplier sees German questions even if the buyer works in English.

## Hospital and supplier in one app

In reality these are different organisations with separate access. For the demo I kept one app with a **role switch**, which sits in a clearly marked demo bar at the bottom of the screen so it doesn't look like part of the product.

What makes this acceptable is that the separation already exists in the API:

- Supplier endpoints are scoped by supplier (`/api/suppliers/:supplier/questions`).
- A supplier can only see and answer questions about its own products. B. Braun can't answer a question addressed to BD.

Adding real authentication would mean putting a check in front of these existing routes, not redesigning them. A separate supplier portal would have meant a second deployment and a login system, and neither would show anything new about the actual problem.

## The LLM gateway

The service doesn't talk to a model provider directly. It sends OpenAI-compatible requests to a **LiteLLM gateway** and only knows a model *alias*, `assessment-model`. Which model sits behind the alias is configured in `litellm/config.yaml`. It is also then easy to extend and replace models.

This paid off during development, more than I expected:

- **Model deprecation.** The provider retired the hosted model I first configured. Switching was a one-line change in the gateway config.
- **Unsupported parameter.** Its successor rejects the `temperature` parameter. The gateway drops unsupported parameters per model (`drop_params`), so the service still sends the same request everywhere.
- **Provider outage.** The hosted provider returned "high demand" errors for a while. The gateway retries twice and then falls back to a local model served by Ollama, so the demo keeps working, even offline.

None of these required a code change. The service also has its own virtual key, which is only allowed to use the assessment models, instead of the gateway's master key.

## Client Web Side

The UI shows the main flow and hides detail behind collapsible "Details" sections:

- the hospital's full master data;
- the attribute-by-attribute table with the LLM's reasoning;
- the catalog source and page;
- when the assessment ran.

The article list shows each article's derived status. Two of them cover the requirement to show when there is no equivalent: "No equivalent" (every candidate was assessed and none matches) and "No candidates" (no supplier offers anything in that category).

- **Languages.** All UI text lives in `client/src/i18n/en.json` and `de.json`. The build fails if a key is missing in German. LLM reasoning arrives in both languages from the same call, so nothing is translated after the fact. Product names and catalog values are not translated; they're identifiers in their source language.
- **Themes.** A light and a dark theme, built on Ant Design's theme tokens and the brand palette.
- **Enum-like values** (verdicts, statuses, categories) are `as const` objects rather than TypeScript `enum`s, because the project's compiler settings don't allow `enum`.

## Known limitations

- **The data lives in memory**, so restarting the service resets all assessments and answers. Every access goes through a few functions in `service/src/data/store.ts`, so moving to Postgres wouldn't touch the routes.
- **No ingestion script yet;** the seed data was prepared by hand (see above).
- **No authentication;** the role switch stands in for it.
- **The score weighs all attributes equally.** In reality some attributes, sterility for example, should be hard requirements. A per-category weighting or "must match" flag would be the next refinement.
- **One LLM call per judged attribute** is simple and reliable but costs more calls than one combined request. With a stronger model, batching the attributes again would be worth measuring.
- **No automated tests yet.** The rules decided in code (missing, identical, coded, quote verification) are the obvious first candidates.
- **The hospital sample data looks partly fictional.** Some GTINs follow placeholder patterns, and some article numbers don't exist in the real catalogs. The catalogs themselves are real.
