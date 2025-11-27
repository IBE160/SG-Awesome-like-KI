# Refleksjonsrapport - Programmering med KI

## 1. Gruppeinformasjon

**Gruppenavn:** SG-Awsome-like-KI

**Gruppemedlemmer:**
- Hannah Letmolie - Halet4544@himolde.no/Hannah.Letmolie02@gmail.com
- Marthe Bjerke - [Student-ID/E-post]
- Sofie Brandstad - [Student-ID/E-post]

**Dato:** [DD.MM.ÅÅÅÅ]

---

## 2. Utviklingsprosessen

### 2.1 Oversikt over prosjektet
Vi har utviklet en nettbasert applikasjon, AI Study Buddy, som skal hjelpe studenter å håndtere store mengder pensum på en mer effektiv og motiverende måte. Den overordnede strategien har vært å skape et hjelpemiddel som imøtekommer et reelt behov i studiehverdagen, med en visjon om at alle typer studenter skal kunne dra nytte av verktøyet. Applikasjonen er derfor designet for å tilpasse seg ulike studievaner og legge til rette for rask og motiverende læring.

Hovedmålet var å gi brukerne et verktøy som kan:

- oppsummere tunge tekster og forelesningsslidene til korte, forståelige sammendrag
- generere tilpassede flervalgstester basert på eget pensum
- gi positiv og motiverende tilbakemelding for å redusere stress og opplevelsen av å “ligge bakpå”.

Prosjektet er særlig rettet mot studenter som opplever informasjons-overload, for eksempel studenter med ADHD/dysleksi, ambisiøse studenter som sikter på toppkarakterer, og studenter som kombinerer studier med jobb og familieliv.

### 2.2 Arbeidsmetodikk
Vi valgte en pragmatisk, lettvektsvariant av smidig utvikling:

Organisering av arbeidet

- Vi jobbet hovedsakelig synkront i Teams, der én person delte skjerm og kodet i VS Code, mens de andre ga innspill, kvalitetssikret og foreslo endringer.
- Vi roterte på “driver”-rollen i VS Code slik at alle fikk hands-on erfaring med kodebasen.
- For enkelte oppgaver delte vi oss og jobbet mer sekvensielt: én tok databasedesign, én tok UI, én fokuserte på KI-integrasjon, før vi merge’et alt inn igjen.
### 2.3 Teknologi og verktøy
[Liste over de viktigste teknologiene og verktøyene dere brukte]
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Vercel Functions (for AI integration)
- Database: Supabase (PostgreSQL)
- KI-verktøy: Gemini CLI
- Andre verktøy: Git, VS Code

### 2.4 Utviklingsfaser
[Beskriv de ulike fasene i utviklingen]

**Fase 1: Planlegging**
I planleggingsfasen hadde vi som mål å forankre prosjektet i reelle brukerbehov og definere en tydelig MVP.

Vi brukte KI-agenten “analyst” i Gemini til flere runder med:

- brainstorming-sessions: kartlegging av mulige konsepter, funksjoner og målgrupper
- research-sessions: identifisering av relevante brukerproblemer (informasjonsoverload, stress, neurodiversitet) og eksisterende løsninger.

Første runde gjorde vi sammen på skjermdeling, der vi:

- formulerte overordnede prompts om “studenter som er overveldet av pensum”
- ba KI om å identifisere typiske smertepunkter, personaer og brukerhistorier.

Deretter lot vi KI foreslå en liste over nye sesjoner vi burde kjøre (f.eks. “risikoanalyse”, “funksjonsprioritering”, “data- og sikkerhetsbehov”). Disse fordelte vi mellom oss og kjørte hver vår runde med prompts.

Totalt landet vi på rundt 7 brainstorming-sesjoner og 7 research-sesjoner, som ble dokumentert i prosjektmappen (/docs/brainstorming-sessions og /docs/research-sessions).

Utfallet av fase 1 var:

- et tydelig problemstatement (informasjonsoverload hos studenter)
- tre konkrete personas (Alex, Ben, Sarah)
- en prioritert MVP-liste (autentisering, filopplasting, sammendrag, quiz, motivasjonsfeedback, enkel UI)
- en grov tidsplan for fire uker.

**Fase 2: Utvikling**
I utviklingsfasen gikk vi stegvis fra idé til fungerende MVP:

Oppsett og infrastruktur

- Opprettet Supabase-prosjekt, satte opp databasen basert på forslaget i proposal (users, classes, class_sections, study_materials, generated_content, junction tables).
- Implementerte Row Level Security (RLS) og testet at brukere kun ser egne data.
- Konfigurerte Next.js-appen og integrerte Supabase via @supabase/ssr.

Frontend og brukerflyt

- Implementerte innlogging/registrering og en enkel “dashboard”-visning med klasser og seksjoner.
- Lagde UI for filopplasting (tekst/PDF) og visning av opplastet materiale.
- Designet sider for genererte sammendrag og to typer quiz (daily quizzes og bootcamp, som dekker hele kapittel), inkludert visning av score og motiverende meldinger.

KI-integrasjon

- Skisset ut en Vercel Function som:
  - tar inn tekst fra opplastet pensum
  - sender dette til KI-modellen med instruksjon om å lage sammendrag eller flervalgstest
  - returnerer strukturert JSON (spørsmål, alternativer, fasit).
- Testet flere prompt-varianter for å få:
  - korte, presise sammendrag
  - relevante quizspørsmål med forståelige alternativer.

Vi brukte Gemini i utviklingsfasen til å:

- generere førsteutkast til funksjoner for parsing og validering av AI-respons
- foreslå robust error-handling rundt KI-kall.

Testing og iterasjon

- Manuell testing av hele brukerreisen: opprett bruker → last opp fil → generer sammendrag → generer quiz → se score.
- Justerte promptene når sammendragene ble for generelle eller quizene ble for enkle.
- Fikset flere mindre bugs knyttet til state-håndtering i Next.js og synkronisering mot Supabase.

---

## 3. Utfordringer og løsninger

### 3.1 Tekniske utfordringer
[Beskriv 2-3 konkrete tekniske problemer dere møtte]

**Utfordring 1: Håndtering av lange tekster og KI-begrensninger**
- Problem: Pensumfiler og slidedecks kan være lange. Når vi sendte for mye tekst til KI-modellen, fikk vi enten timeout, kuttet respons eller usammenhengende sammendrag.
- Løsning: [Hvordan løste dere det?]
- KI sin rolle: [Hvordan hjalp eller hindret KI dere?]

**Utfordring 2: [Tittel]**
- Problem: [Beskriv problemet]
- Løsning: [Hvordan løste dere det?]
- KI sin rolle: [Hvordan hjalp eller hindret KI dere?]

### 3.2 Samarbeidsutfordringer
Vi opplevde noen klassiske utfordringer knyttet til teamarbeid og kommunikasjon, spesielt med tanke på ulik timeplan og arbeidsflyt:

- **Faser og rekkefølge:** Vi oppdaget ulikheter mellom rekkefølgen på fasene i presentasjonsmateriellet og den faktiske prosjektplanen, noe som krevde koordinering.
- **KI-ens “eget liv”:** Gemini ga oss til tider utfordringer ved å handle uventet eller kreve justeringer, noe som tok tid å håndtere.
- **Tid og tilgjengelighet:** Gruppesamarbeidet fungerte ellers bra, men en utfordring var at noen gruppemedlemmer hadde mest tid til å jobbe på dagtid i ukedagene, mens andre, med full jobb og barn, primært kunne bidra kveldstid og i helger. Dette krevde fleksibilitet i planlegging og gjennomføring.

### 3.3 KI-spesifikke utfordringer
**Feil kode og hallucinasjoner:**
- Problem: KI foreslo enkelte ganger kode som ikke passet versjonen av bibliotekene vi brukte (særlig Next.js og Supabase).
- Løsning: Vi lærte å teste alt lokalt med en gang, og aldri stole blindt på at kodeforslagene fungerer. Vi ble også mer konkrete i promptene, da AI ikke alltid forstod hva vi mente.

---

## 4. Kritisk vurdering av KI sin påvirkning

### 4.1 Fordeler med KI-assistanse
[Reflekter over de positive aspektene]

**Effektivitet og produktivitet:**
KI kuttet ned tiden vi brukte på “kjedelige” ting: boilerplate-kode, grunnstrukturen i komponenter, førsteutkast til databasedesign og feilmeldinger.

Spesielt planleggingsfasen gikk raskere: i stedet for å starte med blanke ark, fikk vi på kort tid ut flere alternative konsepter og personas vi kunne vurdere kritisk.

**Læring og forståelse:**
Vi brukte KI aktivt som forklaringsmotor:

- til å bryte ned nye konsepter (RLS, serverless functions, token-begrensninger)
- til å forklare feilmeldinger på en mer pedagogisk måte enn bare stack traces.

Det gjorde at vi kom raskere over kneika på nye teknologier som learning by doing and failing.

**Kvalitet på koden:**
- [Hvordan påvirket KI kodekvaliteten?]
- [Eksempler på forbedringer KI foreslo]

### 4.2 Begrensninger og ulemper
[Reflekter over de negative aspektene]

**Kvalitet og pålitelighet:**
KI gir ofte svar med høy selvtillit, selv når de er feil. Vi opplevde:

- utdatert syntaks
- API-kall som ikke stemte med dokumentasjonen
- for generelle eller overfladiske løsningsforslag.

Men her kunne vi spørre AI om å gå over eller gjøre bedre, samt gi bedre prompter.

**Avhengighet og forståelse:**
Det er lett å bli fristet til å la KI “løse problemet” i stedet for å tenke selv.

Vi merket at hvis vi ikke stoppet opp og stilte spørsmålet “forstår vi egentlig dette?”, blir vi litt sårbare, men det er utrolig hva KI fikser av egne feil.

**Kreativitet og problemløsning:**
KI kan snevre inn tankesettet hvis man alltid starter med “foreslå en løsning”.

De beste ideene kom faktisk når vi først diskuterte internt, og deretter brukte KI til å teste og utfordre ideene – ikke motsatt. Vi ble kreative sammen KI da vi bygger videre på forslagene.

### 4.3 Sammenligning: Med og uten KI
Uten KI:

- Planleggingen ville vært langt tyngre og tatt betydelig lenger tid.
- Vi hadde brukt mer tid på å lese oss opp på alt av databaser og hvilkne som passer.

Med KI:

- Vi reduserte tiden på grunnarbeid, men måtte investere tid i validering og kvalitetssikring.
- Prosjektet ble mer ambisiøst enn vi realistisk hadde turt uten KI (flere features innenfor samme tidsramme).

Konklusjonen er at KI gjorde prosjektet mulig på dette ambisjonsnivået på en gøyal måte. Vi har lært mye nytt sammen med KI inni VSCode. Og ting vi ikke hadde peiling på så spurte vi bare KI.

### 4.4 Samlet vurdering
Netto effekt: klart positiv. KI var en kraftig akselerator, både faglig og praktisk.

Viktigste lærdom: KI må behandles som en kunnskapsrik, men ikke stole blindt på den, men heller stille gode, presise spørsmål.

---

## 5. Etiske implikasjoner

### 5.1 Ansvar og eierskap
Selv om KI genererer kode og tekst, ligger ansvaret for sluttresultatet hos oss som utviklere.

Vi ser på KI-koden som forslag, ikke ferdig produkt. Det innebærer:

- at vi må forstå hva koden gjør, spesielt rundt sikkerhet, tilgangskontroll og datalagring
- at vi ikke kan skylde på KI hvis noe går galt.

Opphavsrett: så lenge vi bruker KI som verktøy i en studentoppgave og ikke kopierer fra spesifikke, beskyttede kilder, vurderer vi risikoen som lav – men det er viktig å være åpen om at KI er brukt.

### 5.2 Transparens
For et reelt produkt mot brukere ville vi vært tydelige på at:

- sammendrag og quiz er generert av KI
- svar kan være feil eller ufullstendige.

I prosjektet vårt dokumenterer vi KI-bidrag gjennom:

- lagrede research- og brainstorming-sesjoner
- denne refleksjonsrapporten, som eksplisitt beskriver hvor og hvordan KI er brukt.

Manglende transparens om KI-bruk kan svekke tillit og gi falsk trygghet rundt presisjon og nøyaktighet.

### 5.3 Påvirkning på læring og kompetanse
Fordel: KI senker terskelen for å eksperimentere og gjør det raskere å lære nye rammeverk.

Risiko: hvis man konsekvent lar KI skrive koden, utvikler man ikke dyp forståelse av arkitektur, feilsøking og optimalisering.

Vi mener balansen bør være:

- KI for å komme raskt i gang og få inspirasjon
- bevisst tid til å refaktorere, kommentere og forklare egen kode uten KI.

### 5.4 Arbeidsmarkedet
Vi forventer at KI-verktøy blir standard i utviklerverktøykassen.

Roller som kun handler om ren “mekking av boilerplate-kode” vil bli mindre viktige.

Roller som kombinerer:

- domeneforståelse
- arkitektur
- kvalitetssikring og sikkerhet
- evne til å coache og styre KI,

blir viktigere. Dette påvirker også hvordan vi bør rigge vår egen karriere – mer fokus på problemløsning, kritisk tenkning og systemdesign enn ren syntaks.

### 5.5 Datasikkerhet og personvern
I prosjektet vårt har vi bevisst valgt et lavrisiko-scenario:

Minn oss på å legge inn mere her.

---

## 6. Teknologiske implikasjoner

### 6.1 Kodekvalitet og vedlikehold
KI-kode kan være effektiv i øyeblikket, men:

- navngiving, struktur og mønstre er ikke alltid konsistente
- det er lett å ende opp med “spaghetti” hvis man bare lapper på nye snippets fra KI.

Vedlikehold blir krevende hvis man ikke rydder fortløpende. Vi har derfor:

- ryddet i komponenter

### 6.2 Standarder og beste praksis
KI følger ikke alltid beste praksis:

- vi fikk forslag basert på eldre versjoner av Next.js og Supabase
- enkelte løsninger var lite skalerbare eller manglet feilhåndtering.

Dette understreker viktigheten av:

- å lese offisiell dokumentasjon
- bruke KI som supplement, ikke primær kilde til sannhet.

### 6.3 Fremtidig utvikling
Vi tror KI vil:

- automatisere mer av “standard-koden”
- flytte tyngdepunktet i utvikling mot arkitektur, konseptutforming og kvalitetssikring.

Viktige ferdigheter fremover:

- prompt engineering (stille gode spørsmål)
- evne til å evaluere og forbedre KI-forslag
- forståelse av dataflyt, sikkerhet og personvern.

Vår anbefaling er at utviklere lærer seg å designe prosesser der KI inngår, ikke bare å bruke KI som et fancy autocompletion-verktøy. Og ikke minst det vi lærte i første forelesning "INGEN TING ER SIKKERT"  og at det som var i går er nok gammelt i dag.

---

## 7. Konklusjon og læring

### 7.1 Viktigste lærdommer
1. Et grundig grunnarbeid i prosjektets tidlige faser er avgjørende for suksess.
2. KI er en kraftig akselerator, men bare når vi kombinerer den med kritisk tenkning og egen faglig forståelse.
3. God struktur på prosjektet er megaviktig; selv om KI automatiserer mye, er sammenhengen kritisk.
4. Feedback til KI forbedrer resultater og understreker at ingenting er sikkert; det som var sant i går, er kanskje utdatert i dag.
5. Gode prompter i samarbeid med KI, samt mestring av prompter og kontekst som støtter prompten (for LLM), er essensielt.

### 7.2 Hva ville dere gjort annerledes?
Minn oss på å legge noe her.

### 7.3 Anbefalinger
**Effektiv bruk av KI**

- Bruk KI tidlig til idémyldring, research og førsteutkast – ikke til siste finish.
- Vær konkret og presis i promptene; spesifiser rammeverk, versjoner og ønsket outputformat.

**Fallgruver:**
- Lange prompter når man er sliten og tom for de rette ordene.

### 7.4 Personlig refleksjon (individuelt)

**[Navn på gruppemedlem 1]:**
Hva jeg kunne fra før (f.eks. lite/ingen erfaring med Next.js/KI). Minn oss på å legge til mer her.

**[Navn på gruppemedlem 2]:**
[Personlig refleksjon over egen læring og utvikling]

**[Navn på gruppemedlem 3]:**
[Personlig refleksjon over egen læring og utvikling]

---

## 8. Vedlegg (valgfritt)

- Skjermbilder av applikasjonen
- Lenke til GitHub repository
- Annen relevant dokumentasjon

---

**Ordantall:** [Ca. antall ord]

**Forventet lengde:** 3000-5000 ord (avhengig av gruppestørrelse og prosjektets kompleksitet)
