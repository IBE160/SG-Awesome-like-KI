# Refleksjonsrapport - Programmering med KI

## 1. Gruppeinformasjon

**Gruppenavn:** SG-Awsome-like-KI

**Gruppemedlemmer:**
- Hannah Letmolie - Halet4544@himolde.no/Hannah.Letmolie02@gmail.com
- Marthe Bjerke - 251753-marthe.bjerke@live.no/mabje4340@himolde.no
- Sofie Brandstad - 230741/sofie.i.branstad@himolde.no

**Dato:** [DD.MM.ÅÅÅÅ]

---

## 2. Utviklingsprosessen

### 2.1 Oversikt over prosjektet
Vi har utviklet en applikasjon ved navn AI Study Buddy som skal hjelpe studenter å håndtere store mengder pensum på en mer effektiv og motiverende måte ved å bruke KI til å generere oppsummeringer og quizer. Den overordnede strategien har vært å skape et hjelpemiddel som imøtekommer et reelt behov i studiehverdagen, med en visjon om at alle typer studenter skal kunne dra nytte av verktøyet. Applikasjonen er derfor designet for å tilpasse seg ulike studievaner og legge til rette for rask og motiverende læring.

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

Eksempler på spesifikke prompter brukt i Fase 2:
- **For quizgenerering:** "Generer en flervalgstest med 5 spørsmål basert på følgende tekst, med 4 alternativer per spørsmål og marker riktig svar i JSON-format: [tekst]"
- **For debugging:** "Analyser følgende JavaScript-kode for en Next.js-komponent og identifiser potensielle feil relatert til state-håndtering med Supabase, og foreslå forbedringer: [kode]"

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
- Løsning: Vi implementerte en strategi for segmentering av lange tekster, der input ble delt opp i mindre biter før sending til KI-modellen. Dette reduserte risikoen for timeout og kuttet respons. For sammendrag ble del-sammendragene deretter flettet sammen. For quizer ble spørsmål generert per segment og deretter samlet.
- KI sin rolle: KI hjalp oss med å foreslå metoder for tekstsegmentering og ga veiledning i hvordan man best kunne sy sammen genererte svar fra flere KI-kall. I tillegg bidro KI med å generere testdata for å validere segmenteringslogikken. Denne utfordringen understreket viktigheten av god prompt engineering og iterativ testing for å tilpasse seg KI-modellens begrensninger.
- **Påminnelse:** Husk å legge til mer spesifikke detaljer om løsningen og KI's rolle her senere.

**Utfordring 2: Supabase Auth + RLS**
- Problem: Implementering av brukerautentisering med Supabase Auth og sikring av data med Row Level Security (RLS) var mer komplekst enn antatt. Det var utfordrende å konfigurere RLS-policyer korrekt for å sikre at brukere kun fikk tilgang til egne data, samtidig som applikasjonen måtte kunne utføre visse operasjoner på tvers av brukerdata (f.eks. for admin-funksjoner eller deling). Feilkonfigurering kunne føre til enten sikkerhetshull eller funksjonalitetsproblemer.
- Løsning: Vi løste utfordringene ved å nøye studere Supabase sin dokumentasjon for RLS og autentisering i Next.js-miljøer. Vi implementerte policyer som sikret at hver bruker kun hadde tilgang til data tilknyttet sin egen `user_id`. For operasjoner som krevde høyere privilegier (f.eks. initialisering av brukerprofiler ved registrering), utnyttet vi Next.js' API-ruter med `service_role` nøkkelen for å omgå RLS midlertidig og sikkert. Dette sikret en balanse mellom sikkerhet og funksjonalitet. Grundig testing av hver enkelt RLS-policy ble utført for å validere at ingen uønsket tilgang var mulig, og at systemet fungerte som forventet for autoriserte brukere.

- KI sin rolle: KI var uvurderlig i denne prosessen. Den hjalp oss med å forstå komplekse RLS-konsepter ved å forklare SQL-syntaks og logikken bak ulike policyer. Vi brukte KI til å generere eksempler på RLS-policyer basert på våre databasetabeller og til å feilsøke policyer som ikke fungerte som forventet. KI bidro også med å foreslå hvordan vi best kunne integrere Supabase Auth i Next.js med server-side components og client-side components, samt hvordan vi skulle håndtere sesjoner og brukerdata på en sikker måte. spesielt med `createClient()` fra `@supabase/ssr` og håndtering av cookies for autentiseringsflyten.
- **Påminnelse:** Husk å legge til mer spesifikke detaljer om løsningen og KI's rolle her senere.

### 3.2 Samarbeidsutfordringer
Vi opplevde noen klassiske utfordringer knyttet til teamarbeid og kommunikasjon, spesielt med tanke på ulik timeplan og arbeidsflyt:

- **Faser og rekkefølge:** Vi oppdaget ulikheter mellom rekkefølgen på fasene i presentasjonsmateriellet og den faktiske prosjektplanen, noe som krevde koordinering.
- **KI-ens “eget liv”:** Gemini ga oss til tider utfordringer ved å handle uventet eller kreve justeringer, noe som tok tid å håndtere.
- **Tid og tilgjengelighet:** Gruppesamarbeidet fungerte ellers bra, men en utfordring var at noen gruppemedlemmer hadde mest tid til å jobbe på dagtid i ukedagene, mens andre, med full jobb og barn, primært kunne bidra kveldstid og i helger. Dette krevde fleksibilitet i planlegging og gjennomføring.

I tillegg til de rent tekniske problemene, støtte vi på utfordringer knyttet til samspillet mellom verktøy, KI og team-arbeidsflyt:

- **Uforutsette verktøykonflikter:** Å kjøre en CLI-agent (Gemini) inne i en terminal, som igjen kjører i VS Code på Windows, skapte uventede problemer. Spesielt i sluttfasen opplevde vi at Ctrl + F-snarveien for å fokusere terminalen i Gemini, ofte ble fanget opp av VS Codes egen søkefunksjon. Dette førte til forvirring og små, men hyppige, avbrudd i arbeidsflyten.

- **Uforutsigbarhet med KI-agenten:** Selv om Gemini var en kraftig medhjelper, hadde den tidvis "sitt eget liv". Den kunne for eksempel foreslå eller forsøke å kjøre kommandoer (som git commit) før vi i teamet var enige, eller misforstå en instruksjon som krevde at vi måtte stoppe opp, korrigere og veilede den på nytt. Dette introduserte et nytt lag med "AI-management" som vi måtte lære oss å håndtere.

- **Git-arbeidsflyt og merge-konflikter:** Som i mange team-prosjekter, var versjonskontroll med Git en utfordring. Selv med en i hovedsak synkron arbeidsmetode, oppsto det tidvis forvirring rundt hvilken branch som var den korrekte å jobbe på, og vi støtte på mindre merge-konflikter. Dette krevde ekstra kommunikasjon for å sikre at alles endringer ble riktig integrert og at vi i

I tillegg til de rent tekniske problemene, støtte vi på utfordringer knyttet til samspillet mellom verktøy, KI og team-arbeidsflyt:

- **Uforutsette verktøykonflikter:** Å kjøre en CLI-agent (Gemini) inne i en terminal, som igjen kjører i VS Code på Windows, skapte uventede problemer. Spesielt i sluttfasen opplevde vi at Ctrl + F-snarveien for å fokusere terminalen i Gemini, ofte ble fanget opp av VS Codes egen søkefunksjon. Dette førte til forvirring og små, men hyppige, avbrudd i arbeidsflyten.
- **Uforutsigbarhet med KI-agenten:** Selv om Gemini var en kraftig medhjelper, hadde den tidvis "sitt eget liv". Den kunne for eksempel foreslå eller forsøke å kjøre kommandoer (som git commit) før vi i teamet var enige, eller misforstå en instruksjon som krevde at vi måtte stoppe opp, korrigere og veilede den på nytt. Dette introduserte et nytt lag med "AI-management" som vi måtte lære oss å håndtere.
- **Git-arbeidsflyt og merge-konflikter:** Som i mange team-prosjekter, var versjonskontroll med Git en utfordring. Selv med en i hovedsak synkron arbeidsmetode, oppsto det tidvis forvirring rundt hvilken branch som var den korrekte å jobbe på, og vi støtte på mindre merge-konflikter. Dette krevde ekstra kommunikasjon for å sikre at alles endringer ble riktig integrert og at vi i

### 3.3 KI-spesifikke utfordringer
**Feil kode og hallucinasjoner:**
- Problem: KI foreslo enkelte ganger kode som ikke passet versjonen av bibliotekene vi brukte (særlig Next.js og Supabase).
- Løsning: Vi lærte å teste alt lokalt med en gang, og aldri stole blindt på at kodeforslagene fungerer. Vi ble også mer konkrete i promptene, da AI ikke alltid forstod hva vi mente. Dette understreker viktigheten av god prompt engineering.
- **Påminnelse:** Husk å legge til mer detaljer om spesifikke tilfeller av feil kode/hallusinasjoner og hvordan prompt engineering ble brukt for å overkomme dette.

### 3.4 Verktøy- og arbeidsflyt-utfordringer
I tillegg til de rent tekniske problemene, støtte vi på utfordringer knyttet til samspillet mellom verktøy, KI og team-arbeidsflyt:

- **Uforutsette verktøykonflikter:** Å kjøre en CLI-agent (Gemini) inne i en terminal, som igjen kjører i VS Code på Windows, skapte uventede problemer. Spesielt i sluttfasen opplevde vi at `Ctrl + F`-snarveien for å fokusere terminalen i Gemini, ofte ble fanget opp av VS Codes egen søkefunksjon. Dette førte til forvirring og små, men hyppige, avbrudd i arbeidsflyten.

- **Uforutsigbarhet med KI-agenten:** Selv om Gemini var en kraftig medhjelper, hadde den tidvis "sitt eget liv". Den kunne for eksempel foreslå eller forsøke å kjøre kommandoer (som `git commit`) før vi i teamet var enige, eller misforstå en instruksjon som krevde at vi måtte stoppe opp, korrigere og veilede den på nytt. Dette introduserte et nytt lag med "AI-management" som vi måtte lære oss å håndtere.

- **Git-arbeidsflyt og merge-konflikter:** Som i mange team-prosjekter, var versjonskontroll med Git en utfordring. Selv med en i hovedsak synkron arbeidsmetode, oppsto det tidvis forvirring rundt hvilken branch som var den korrekte å jobbe på, og vi støtte på mindre merge-konflikter som krevde ekstra kommunikasjon for å løse.

- **Kontinuerlig integrasjon (CI) og build-feil:** Flere ganger opplevde vi at kode som fungerte perfekt lokalt, likevel feilet i den automatiske byggeprosessen på serveren etter en `git push`. Vi ble møtt med feilmeldinger som: `All checks have failed. 1 failing check. CI / build (push) Failing after 17s`. Dette tvang oss til å dykke ned i serverlogger for å feilsøke problemer som ikke var synlige i vårt lokale utviklingsmiljø, en vanlig, men tidkrevende, del av moderne programvareutvikling.

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

I tillegg til ren effektivitet, opplevde vi at KI fungerte som en kreativ sparringspartner. Den foreslo funksjoner, brukerhistorier og konsepter vi ikke hadde tenkt på, og fungerte som en katalysator for våre egne ideer.

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

En annen ulempe er tidskostnaden ved 'AI-management'. Selv om KI sparer tid på noen områder, introduserer den en ny type arbeid: å skrive gode prompter, kritisk vurdere output og feilsøke når KI-en 'hallusinerer'. Denne 'overheaden' med å administrere KI-en er en reell ulempe.

### 4.3 Sammenligning: Med og uten KI
Uten KI:

- Planleggingen ville vært langt tyngre og tatt betydelig lenger tid.
- Vi hadde brukt mer tid på å lese oss opp på alt av databaser og hvilkne som passer.

Med KI:

- Vi reduserte tiden på grunnarbeid, men måtte investere tid i validering og kvalitetssikring.
- Prosjektet ble mer ambisiøst enn vi realistisk hadde turt uten KI (flere features innenfor samme tidsramme).

Konklusjonen er at KI gjorde prosjektet mulig på dette ambisjonsnivået på en gøyal måte. Vi har lært mye nytt sammen med KI inni VSCode. Og ting vi ikke hadde peiling på så spurte vi bare KI.

Arbeidsflyten ble også annerledes. Uten KI ville prosessen trolig vært mer lineær (planlegge, så bygge). Med KI ble arbeidsflyten mer syklisk og eksperimentell, hvor vi umiddelbart kunne teste en idé med en prompt og få en prototype. Dette førte til en mer dynamisk, men også potensielt mer kaotisk, utviklingsprosess.

### 4.4 Samlet vurdering
Netto effekt: klart positiv. KI var en kraftig akselerator, både faglig og praktisk.

Viktigste lærdom: KI må behandles som en kunnskapsrik, men ikke stole blindt på den, men heller stille gode, presise spørsmål.

**Påminnelse:** Husk å skrive en endelig samlet vurdering når prosjektet er ferdigstilt, og reflekter over KI-ens rolle i sluttfasen (optimalisering, finpuss, etc.).

---

## 5. Etiske implikasjoner

### 5.1 Ansvar og eierskap
Selv om KI genererer kode og tekst, ligger ansvaret for sluttresultatet hos oss som utviklere.

Vi ser på KI-koden som forslag, ikke ferdig produkt. Det innebærer:

- at vi må forstå hva koden gjør, spesielt rundt sikkerhet, tilgangskontroll og datalagring
- at vi ikke kan skylde på KI hvis noe går galt.

Opphavsrett: så lenge vi bruker KI som verktøy i en studentoppgave og ikke kopierer fra spesifikke, beskyttede kilder, vurderer vi risikoen som lav – men det er viktig å være åpen om at KI er brukt.

Hva skjer hvis vår KI-genererte quiz inneholder en alvorlig faktafeil, og en student pugger dette til eksamen? Ansvaret faller ikke på KI-en, men på oss som utviklere. Dette understreker at vi må ha systemer for kvalitetssikring og kanskje til og med en måte for brukere å flagge feil i det genererte innholdet.

### 5.2 Transparens
For et reelt produkt mot brukere ville vi vært tydelige på at:

- sammendrag og quiz er generert av KI
- svar kan være feil eller ufullstendige.

I prosjektet vårt dokumenterer vi KI-bidrag gjennom:

- lagrede research- og brainstorming-sesjoner
- denne refleksjonsrapporten, som eksplisitt beskriver hvor og hvordan KI er brukt.

En utfordring med åpenhet er at KI-en kan være som en “svart boks”. Selv om vi kan fortelle at en quiz er KI-generert, kan vi ikke alltid forklare hvorfor den stiller et rart spørsmål. For å gjøre koden vår mer sporbar for andre utviklere, kunne vi også vært flinkere til å merke av i kommentarer eller commit-meldinger når kode var laget med KI.

Manglende transparens om KI-bruk kan svekke tillit og gi falsk trygghet rundt presisjon og nøyaktighet.

### 5.3 Påvirkning på læring og kompetanse
Fordel: KI senker terskelen for å eksperimentere og gjør det raskere å lære nye rammeverk.

Risiko: hvis man konsekvent lar KI skrive koden, utvikler man ikke dyp forståelse av arkitektur, feilsøking og optimalisering.

Vi mener balansen bør være:

- KI for å komme raskt i gang og få inspirasjon
- bevisst tid til å refaktorere, kommentere og forklare egen kode uten KI.

Vi må også reflektere etisk over produktet vårt: Oppfordrer 'AI Study Buddy' til dypere, kritisk forståelse av pensum, eller tilrettelegger den for en 'skumlese-og-quiz'-mentalitet? En etisk fallgruve er å skape et verktøy som i praksis gjør studenter dårligere rustet for langsiktig læring, selv om det hjelper dem å bestå en prøve på kort sikt.

### 5.4 Arbeidsmarkedet
Vi forventer at KI-verktøy blir standard i utviklerverktøykassen.

Roller som kun handler om ren “mekking av boilerplate-kode” vil bli mindre viktige.

Roller som kombinerer:

- domeneforståelse
- arkitektur
- kvalitetssikring og sikkerhet
- evne til å coache og styre KI,

blir viktigere.

Forventningene til leveransehastighet vil sannsynligvis øke. Utviklere som kan utnytte KI til å raskt bygge og teste prototyper (MVP-er) for å validere forretningsideer, vil ha en stor fordel.

Verdien av 'myke ferdigheter' som kommunikasjon, kreativ problemløsning og forretningsforståelse vil forsterkes. Å kunne oversette et komplekst kundebehov til en serie effektive prompter og en god systemarkitektur blir en kjernekompetanse.

Dette påvirker også hvordan vi bør rigge vår egen karriere – mer fokus på problemløsning, kritisk tenkning og systemdesign enn ren syntaks.

### 5.5 Datasikkerhet og personvern
I prosjektet vårt har vi fokusert på grunnleggende sikkerhetstiltak som autentisering (Supabase Auth) og autorisasjon (RLS) for å sikre at brukere kun får tilgang til egne data. Vi håndterer i utgangspunktet ikke sensitive personopplysninger utover det som kreves for innlogging.

Vår antakelse om at opplastet pensum er 'ikke-sensitivt' er imidlertid en betydelig forenkling vi gjorde for prosjektet. I en reell verden er dette en stor etisk og juridisk utfordring. Hva om en bruker laster opp en forelesers upubliserte artikkel, en bedriftsintern manual, eller en eksamen under utarbeidelse? Ved å sende dette til en tredjeparts KI-tjeneste, mister brukeren kontroll over sitt eget data. En lansert versjon av appen vår ville krevd en vanntett personvernerklæring, eksplisitt samtykke fra brukeren, og en grundig vurdering av KI-leverandørens databehandlingsavtaler for å sikre at brukerdata ikke misbrukes.

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
- **Mer strukturert bruk av KI i utvikling:** Selv om vi brukte KI mye, var det ofte ad-hoc. En mer systematisk tilnærming til når og hvordan KI skulle brukes i kodefasen (f.eks. for TDD, refaktorering eller komplekse algoritmer) kunne vært mer effektiv.
- **Tidligere fokus på ytelse og skalering:** Vi fokuserte primært på funksjonalitet for MVP. Å vurdere ytelse og skalering av KI-kall og databasen tidligere i prosessen kunne spart tid nedstrøms.
- **Bedre versjonskontrollpraksis for prompts:** Vi samlet mange prompts, men en mer organisert måte å versjonskontrollere og evaluere prompts på (spesielt de som ga best resultater for quiz og sammendrag) kunne vært gunstig.
- **Påminnelse:** Husk å legge til deres egne spesifikke refleksjoner her, gjerne med eksempler fra prosjektet.

### 7.3 Anbefalinger
**Effektiv bruk av KI**

- Bruk KI tidlig til idémyldring, research og førsteutkast – ikke til siste finish.
- Vær konkret og presis i promptene; spesifiser rammeverk, versjoner og ønsket outputformat.
- Still KI-en 'hvorfor'-spørsmål. Bruk den aktivt til å forklare komplekse konsepter, kodeblokker eller feilmeldinger for å bygge dypere forståelse, ikke bare for å få en løsning.

**Fallgruver:**
- Lange prompter når man er sliten og tom for de rette ordene.
- Fristelsen til å 'copy-paste' løsninger uten å investere tid i å forstå den underliggende logikken. Dette hindrer egen læring og kan introdusere skjulte feil.

### 7.4 Personlig refleksjon (individuelt)

**Marthe Bjerke:**
- ***Utgangspunkt:*** Før dette prosjektet hadde jeg begrenset erfaring med praktisk KI-bruk i en utviklingskontekst. Min kjennskap til KI var primært knyttet til enklere tekstbaserte oppgaver som prompter og språkvask, og jeg startet med et ønske om å lære mer om programmering generelt.
- ***Læring:*** Gjennom prosjektet har jeg tatt steget fra ren frontend-utvikling til å få en dypere, praktisk forståelse for hele stacken. KI var en avgjørende støttespiller i denne læringsprosessen, spesielt for å forstå nye og komplekse konsepter som server-side rendering i Next.js og database-integrasjon mot Supabase. Min kompetanse innen KI har utviklet seg fra enkel prompting og språkvask til mer avansert *prompt engineering*, hvor jeg lærte å konstruere presise instrukser for å generere funksjonell kode og strukturert data (som JSON). Kanskje den viktigste lærdommen var knyttet til feilsøking; jeg lærte å systematisk analysere kode der feilen kan ligge enten i min egen logikk eller i 'hallusinasjoner' fra KI-en, noe som har skjerpet min kritiske sans som utvikler.
- ***Viktigste takeaway:*** Den største aha-opplevelsen var å innse at KI fungerer best som en kreativ sparringspartner, ikke en fasit. Den utfordrer ideer, automatiserer rutinearbeid og hjelper til med å belyse problemer fra nye vinkler. Samtidig lærte jeg raskt at verdien av KI er direkte knyttet til min egen evne til å stille kritiske spørsmål og verifisere resultatene. Min takeaway er derfor balansegangen: å omfavne KI for fart og idémyldring, men aldri delegere ansvaret for kvalitet og dømmekraft.

**Hannah Letmolie:**
***utgangspunkt:*** Jeg hadde lite til ingen erfaring om programmering fra tidligere, men har brukt ulike KI-er (som ChatGPT og Copilot) til annet skolearbeid.
***Læring:*** Jeg har fått en mye bredere forståelse for både bruk av KI generelt, og for programmering. Jeg forstår fortsatt ikke alt det tekniske helt, men forstår det bedre enn når jeg startet og har lært hvordan jeg skal bruke Gemini/KI til å finne ut av ting, og få det til å bli riktig. 
***Annet:*** Jeg synes dette var et veldig morsomt prosjekt, selv om det ble litt små-stress på slutten for å få det ferdig til innlevering. Og føler selv jeg har bidratt godt i oppgaven. 

**Sofie Branstad:**
- ***Utgangspunkt:*** Som student på 2. året av bachelor i IT og digitalisering hadde jeg allerede hatt emner som innføring i programmering, videregående programmering, databaser, og webutvikling. Jeg startet derfor med en grunnleggende forståelse av mange av elementene i en applikasjon, men ingen dyptgående kunnskap eller praktiske ferdigheter innen disse områdene. Jeg hadde ingen god forståelse av oppbyggingen av en applikasjon eller samspillet mellom ulike elementer i den, så jeg ønsket å lære mer om dette. Jeg var allerede vant med å bruke KI i skole-og jobbsammenheng, men hovedsakelig til idémyldring og hjelp til å lage eksempler og illustrasjoner. 
- ***Læring og utvikling:*** Jeg har lært å bruke Github til å samarbeide med et team om å utvikle noe sammen. Jeg har også lært en del om hvordan å samhandle med eller styre KI i utviklingsarbeid. Blant annet, hvordan best presentere feilmeldinger eller bugs til KI for å raskt få den til å forstå rotårsaken og gjøre riktige justeringer, og hvordan bygge opp et prompt for å sørge for at KI-en blir styrt i riktig retning. Jeg er usikker på om jeg har lært noe mer om programmering, da jeg ikke har jobber "tett på" koden og, som en konsekvens, ikke egentlig vet hva som står i koden vår fordi den er KI-generert og -redigert. På den annen side har jeg lært en del om byggesteinene til en applikasjon som denne, og hvordan man bruker tjenester som blant annet Supabase for å gjøre det mulig. I den forstand har jeg fått oppfylt noe av det jeg ønsket å lære i utgangspunktet. Jeg har en langt bedre forståelse av hva begrepet "applikasjon" egentlig innebærer på et teknisk nivå og hvor mange ulike elementer som inngår i dette. 
---

## 8. Vedlegg (valgfritt)

- Skjermbilder av applikasjonen
- Lenke til GitHub repository
- Annen relevant dokumentasjon

---

**Ordantall:** [Ca. antall ord]

**Forventet lengde:** 3000-5000 ord (avhengig av gruppestørrelse og prosjektets kompleksitet)
