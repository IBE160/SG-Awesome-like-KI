# Refleksjonsrapport - Programmering med KI

## 1. Gruppeinformasjon

**Gruppenavn:** SG-Awsome-like-KI

**Gruppemedlemmer:**
- Hannah Letmolie - Halet4544@himolde.no/Hannah.Letmolie02@gmail.com
- Marthe Bjerke - 251753-marthe.bjerke@live.no/mabje4340@himolde.no
- Sofie Branstad - 230741/sofie.i.branstad@himolde.no

**Dato:** [04.12.2025]

---

## 2. Utviklingsprosessen

### 2.1 Oversikt over prosjektet
Vi har utviklet en applikasjon ved navn AI Study Buddy som skal hjelpe studenter å håndtere store mengder pensum på en mer effektiv og motiverende måte ved å bruke KI til å generere oppsummeringer og quizer. Den overordnede strategien har vært å skape et hjelpemiddel som imøtekommer et reelt behov i studiehverdagen, med en visjon om at alle typer studenter skal kunne dra nytte av verktøyet. Applikasjonen er derfor designet for å tilpasse seg ulike studievaner og legge til rette for rask og motiverende læring.

Hovedmålet var å gi brukerne et verktøy som kan:

- oppsummere tunge tekster og forelesningslysbilder til korte, forståelige sammendrag
- generere tilpassede flervalgstester basert på eget pensum
- gi positiv og motiverende tilbakemelding for å redusere stress og opplevelsen av å “ligge bakpå”.

Prosjektet er særlig rettet mot studenter som opplever informasjons-overload, for eksempel studenter med ADHD/dysleksi, ambisiøse studenter som sikter på toppkarakterer, og studenter som kombinerer studier med jobb og familieliv.

### 2.2 Arbeidsmetodikk
Vi valgte en pragmatisk, lettvektsvariant av smidig utvikling:

Organisering av arbeidet:

- Vi jobbet hovedsakelig synkront i Teams, der én person delte skjerm og kodet i VS Code, mens de andre ga innspill, kvalitetssikret og foreslo endringer.
- Vi roterte på “driver”-rollen i VS Code slik at alle fikk prøve seg praktisk.
- For enkelte oppgaver delte vi oss og jobbet mer sekvensielt: blant annet fordelte vi ulike brainstorming- og researchtemaer mellom oss slik at vi kunne dekke et større omfang. Det samme gjorde vi under fase 4 der vi fordelte epics mellom oss.
  
### 2.3 Teknologi og verktøy
- Frontend: Next.js, React, Tailwind CSS, shadcn/ui
- Backend: Vercel Functions (for AI integration)
- Database: Supabase (PostgreSQL)
- KI-verktøy: Gemini CLI og ChatGPT
- Andre verktøy: BMAD, Github og VSCode

### 2.4 Utviklingsfaser
Utviklingsprosessen vår var delt inn i fire tydelige faser, der vi benyttet KI som en integrert partner fra de første idéene til den endelige implementeringen. Hver fase hadde et klart formål og definerte leveranser som bygget systematisk på hverandre.

**Fase 1: Analyse**

I denne innledende fasen var hovedmålet å utforske og definere problemområdet. Vi startet med flere brainstorming-sesjoner for å identifisere rotårsaker til studenters utfordringer med store pensummengder. Dette la grunnlaget for å forstå de reelle behovene applikasjonen skulle løse. Parallelt gjennomførte vi teknisk research for å evaluere ulike KI-biblioteker som kunne egne seg for å orkestrere LLM-interaksjoner. 

All innsikt fra denne fasen ble deretter konsolidert i et produktbrief, som fungerte som det første formelle styringsdokumentet for prosjektet. Etter at vi haddde gjennomført syv brainstormingsesjoner og seks research-sesjoner, brukte vi dette promptet for å sørge for at proposal-fila var så god som mulig: "We need to update the @proposal.md file with all our findings from the brainstorming and research sessions. Read the proposal.md file and all files in @docs/brainstorming-sessions/ and @docs/research-sessions/ folders. Then, modify the proposal.md file to reflect all the decisions we made in the brainstorming and research sessions in the relevant sections. Make sure to indicate in the proposal file which brainstorming or research file you used as background information. For example it you write that we will use vercel,make sure to add "see research/brainstorm in file @ .." Be throrough and make sure that the proposal file contains all the necessary information to create a good product brief later. DO NOT make the product brief yet."

KI ble brukt som en aktiv sparringspartner i idémyldringen og som en research-assistent for å sammenstille tekniske alternativer.

**Fase 2: Planlegging**

Med en klarere forståelse av *hva* vi skulle bygge, gikk vi over til å planlegge *hvordan*. Denne fasen startet med utarbeidelsen av et Product Requirements Document (PRD), som detaljerte funksjonalitet, brukerflyt og tekniske krav. For å sikre at vi var på rett spor, ble PRD-en validert. Samtidig jobbet vi med brukererfaringen ved å utvikle en UX-designspesifikasjon, inkludert fargepaletter og overordnede design-retninger. Til slutt ble det tekniske fundamentet lagt ved å definere rammeverk for kontinuerlig integrasjon (CI) og test-design. 

I denne fasen ble KI brukt til å generere førsteutkast til både PRD og UX-dokumenter, noe som ga oss et solid utgangspunkt å iterere på.

**Fase 3: Solutioning**

I solutioning-fasen ble planene omsatt til en konkret teknisk løsning. Vi utarbeidet en detaljert systemarkitektur som beskrev hvordan frontend, backend og databasen skulle samhandle. Med arkitekturen på plass, brøt vi ned de overordnede kravene fra PRD-en til håndterbare epics og brukerhistorier. Dette ga oss en klar og prioritert backlog for utviklingen. Før vi gikk videre til implementering, gjennomførte vi en "readiness"-sjekk for å forsikre oss om at alle tekniske og funksjonelle forutsetninger var på plass. 

KI var her et sentralt verktøy for å visualisere arkitekturen, samt for å bryte ned funksjonalitet i mindre, logiske enheter (epics og stories).

**Fase 4: Implementering**

Den siste fasen handlet om å bygge selve applikasjonen. Vi startet med sprint-planlegging for å organisere arbeidet i en smidig arbeidsflyt. For hver epic og story ble det opprettet tekniske spesifikasjoner som ga utviklerne en klar kontekst for implementeringen. 

Deretter fulgte selve kodingen, hvor hver brukerhistorie ble implementert og validert. Etter Geminis validering av hver implementerte story valgte vi å gjøre manuell testing av funksjonaliteten i brukergrensesnittet. Da lagde vi et prompt som gikk slik: "I want to do a manual test of the features we just implemented in this story. Please guide me through how I can open the application in a browser without opening the interactive shell in this conversation, i.e. opening a different terminal and typing npm run dev. And then explain the steps to verify the features."

KI spilte en avgjørende rolle i denne fasen ved å bistå i generering av kode, utforming av tekniske spesifikasjoner og som en hjelper under testing og feilsøking.

---

## 3. Utfordringer og løsninger

### 3.1 Tekniske utfordringer

**Utfordring 1: Verktøykonflikter og arbeidsflytavbrudd**
- **Problem:** En vedvarende teknisk utfordring oppsto fra samspillet mellom verktøyene vi brukte. Å kjøre Gemini CLI-agenten inne i en terminal, som igjen ble kjørt i VS Code på Windows, skapte en uventet konflikt. Snarveien `Ctrl + F`, som er essensiell for å fokusere på terminalen og gi input til Gemini, ble systematisk fanget opp av VS Codes globale søkefunksjon. Dette førte til at søkevinduet i VS Code åpnet seg i stedet for at terminalen ble aktiv. Denne konflikten førte til konstante små, men hyppige, avbrudd i arbeidsflyten.
- **Løsning:** Medlemmene som opplevde denne utfordringen fant ikke en direkte løsning på dette, så alle oppgaver som krevde denne handlingen måtte gjøres av gruppemedlemmet som hadde MacBook, hvor 'Ctrl + F' funket.
- **KI sin rolle:** I denne situasjonen kunne ikke KI direkte løse verktøykonflikten, da den var et resultat av hvordan VS Code håndterer tastatursnarveier på systemnivå. KI-en var uvitende om vertsmiljøet sitt og kunne derfor ikke diagnostisere eller foreslå en løsning på problemet. Dette illustrerer en begrensning ved KI-agenter: deres manglende evne til å feilsøke problemer som ligger utenfor deres eget kjøremiljø, som for eksempel konflikter i selve utviklingsverktøyet. Problemet måtte løses manuelt av oss som brukere.

**Utfordring 2: Model overload og oppbrukte kvoter**
- Problem: Bruken av KI var helt sentral i dette prosjektet og mye av fremdriften var derfor avhengig av at Gemini var tilgjengelig når vi trengte den og ikke stoppet opp under arbeidet. Dessverre opplevde vi svært ofte at vi fikk feilmeldinger som "The model is overloaded. Please try again later" og "You have exceeded your quota for today. Please try again later". Dette gjorde at arbeidet stoppet opp, ofte midt i viktige prosesser, noe som hindret effektiv fremdrift. Dette ble et økende problem jo nærmere vi kom innleveringsfristen og tiden begynte å renne ut, samtidig som de aller viktigste og mest tidkrevense oppgavene gjensto. 
- Løsning: Det var flere måter å løse disse problemene på. Ved "Model overload"-problemer hadde vi to alternativer: vente et par timer og prøve igjen senere på at annet tidspunkt, eller å forsøke å "spamme" Gemini med kommandoer til den gikk gjennom. Ingen av delene hadde særlig gode resultater. For å komme seg rundt dagskvote-problemet var løsningen å opprette en hel haug med Gemini API-nøkler, og bytte API-nøkkel for hver gang kvoten ble fylt opp. Dette fungerte i praksis men gjorde også at man måtte skrive kommandoer på nytt og kunne bli avbrutt midt i en viktig prosess, og mye tid gikk med på å skrive gode promt som myknet overgangen etter å ha byttet API-nøkkel.
- KI sin rolle: I dette tilfellet var KI-en både årsaken til problemet og en hindring for løsningen. Siden hele prosjektet var avhengig av tilgang til Gemini-modellen, fungerte nedetid og kvotebegrensninger som en hard stopp for all fremdrift. KI-en kunne ikke hjelpe oss med å løse problemet, ettersom det var selve tjenesten som var utilgjengelig. Dette skapte en avhengighetssituasjon der vi ble tvunget til å jobbe rundt KI-en i stedet for med den. Ironisk nok ble KI en barriere for et KI-sentrisk prosjekt, noe som understreker sårbarheten ved å basere en hel arbeidsflyt på en ekstern tjeneste med begrensninger vi ikke kunne kontrollere.


### 3.2 Samarbeidsutfordringer (To av disse er ikke samarbeidsutfordringer)
Vi opplevde noen klassiske utfordringer knyttet til teamarbeid, blant annet med tanke på ulik timeplan og arbeidsflyt:

- **Tid og tilgjengelighet:** Gruppesamarbeidet fungerte ellers bra, men en utfordring var at noen gruppemedlemmer hadde mest tid til å jobbe på kvelden etter jobb, mens andre, med barn, primært kunne bidra i helger. Dette krevde fleksibilitet i planlegging og gjennomføring.

- **Git-arbeidsflyt og merge-konflikter:** Som i mange team-prosjekter, var versjonskontroll med Git en utfordring. Selv med en i hovedsak synkron arbeidsmetode, oppsto det tidvis forvirring rundt hvilken branch som var den korrekte å jobbe på, og vi støtte på mindre merge-konflikter som krevde ekstra kommunikasjon for å løse.

### 3.3 KI-spesifikke utfordringer
**Feil kode og hallucinasjoner:**
- Problem: KI foreslo enkelte ganger kode som ikke passet versjonen av bibliotekene vi brukte (særlig Next.js og Supabase).
- Løsning: Vi lærte å teste alt lokalt med en gang, og aldri stole blindt på at kodeforslagene fungerer. Vi ble også mer konkrete i promptene, da AI ikke alltid forstod hva vi mente. Dette understreker viktigheten av god prompt engineering.
- **Uforutsigbarhet med KI-agenten:** Selv om Gemini var en kraftig medhjelper, hadde den tidvis "sitt eget liv". Den kunne for eksempel foreslå eller forsøke å kjøre kommandoer (som `git commit`) før vi i teamet var enige, eller misforstå en instruksjon som krevde at vi måtte stoppe opp, korrigere og veilede den på nytt. Dette introduserte et nytt lag med "AI-management" som vi måtte lære oss å håndtere.
- **KI-ens “eget liv”:** Gemini ga oss til tider utfordringer ved å handle uventet eller kreve justeringer, noe som tok tid å håndtere.


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
KI hadde en positiv innvirkning på kodekvaliteten ved å sikre en konsistent og logisk struktur, samt ved å hjelpe oss med å overholde etablerte kodekonvensjoner. Den foreslo også refaktoreringer som forbedret lesbarheten og effektiviteten i koden.

Blant de konkrete forbedringene KI foreslo, var generering av grunnstrukturer for React-komponenter, veiledning for implementering av sikkerhetstiltak som Row Level Security (RLS) i Supabase, og forslag til Tailwind CSS-klasser for å oppnå et responsivt design.

### 4.2 Begrensninger og ulemper

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
- Vi hadde brukt mer tid på å lære oss applikasjonsutvikling, undersøke og vurdere ulike teknologialternativer, og feilsøke underveis i utviklingen.

Med KI:

- Vi reduserte tiden på grunnarbeid, men måtte investere tid i validering og kvalitetssikring.
- Prosjektet ble mer ambisiøst enn vi realistisk hadde turt uten KI (flere features innenfor samme tidsramme).

Konklusjonen er at KI gjorde prosjektet mulig på dette ambisjonsnivået på en gøyal måte. Vi har lært mye nytt med KI og kunne spørre KI om hjelp dersom det var noe vi ikke forstod eller trengte hjelp med.

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
Vi forventer at KI-verktøy blir standard i utviklerverktøykasse og at roller som kun handler om ren skriving av kode vil bli mindre fremtredende.

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

Grunnet omfanget av oppgaven samt at applikasjonen ikke er tilgjengelig fra internett har ikke sikkerhet vært det største fokuset under uviklingen. Dersom vi hadde hatt mer tid og dette var et reelt prosjekt, kunne det for eksempel vært aktuelt å gjøre noen enkle penetrasjonstester for å sikre at ingen åpenlyse sikkerhetshull er tilstede som kan gi uautoriserte personer tilgang til brukerkontoer eller data.

Vår antakelse om at opplastet pensum er 'ikke-sensitivt' er imidlertid en betydelig forenkling vi gjorde for prosjektet. I en reell verden er dette en stor etisk og juridisk utfordring. Hva om en bruker laster opp en forelesers upubliserte artikkel, en bedriftsintern manual, eller en eksamen under utarbeidelse? Ved å sende dette til en tredjeparts KI-tjeneste, mister brukeren kontroll over sitt eget data. En lansert versjon av appen vår ville krevd en vanntett personvernerklæring, eksplisitt samtykke fra brukeren, og en grundig vurdering av KI-leverandørens databehandlingsavtaler for å sikre at brukerdata ikke misbrukes.

---

## 6. Teknologiske implikasjoner

### 6.1 Kodekvalitet og vedlikehold
KI-kode kan være effektiv i øyeblikket, men navngiving, struktur og mønstre er ikke alltid konsistente. Vedlikehold blir krevende hvis man ikke rydder fortløpende. Vi har derfor ryddet i mappestrukturen fortløpende.

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

Vår anbefaling er at utviklere lærer seg å designe prosesser der KI inngår, ikke bare å bruke KI som et fancy autocompletion-verktøy. Og ikke minst det vi lærte i første forelesning "INGEN TING ER SIKKERT" og at det som var i går er nok gammelt i dag.

---

## 7. Konklusjon og læring

### 7.1 Viktigste lærdommer
1. Et grundig grunnarbeid i prosjektets tidlige faser er avgjørende for suksess.
2. KI er en kraftig akselerator, men bare når vi kombinerer den med kritisk tenkning og egen faglig forståelse.
3. God struktur på prosjektet er megaviktig; selv om KI automatiserer mye, er sammenhengen kritisk.
4. Feedback til KI forbedrer resultater og understreker at ingenting er sikkert; det som var sant i går, er kanskje utdatert i dag.
5. Gode prompter i samarbeid med KI, samt mestring av prompter og kontekst som støtter prompten (for LLM), er essensielt.

### 7.2 Hva ville dere gjort annerledes?
- **Tidligere fokus på ytelse og skalering:** Vi fokuserte primært på funksjonalitet for MVP. Å vurdere ytelse og skalering av KI-kall og databasen tidligere i prosessen kunne spart tid nedstrøms.
- **Bedre versjonskontrollpraksis for prompts:** Vi samlet noen prompts, men en mer organisert måte å versjonskontrollere og evaluere prompts på  kunne vært gunstig.

### 7.3 Anbefalinger
**Effektiv bruk av KI**
- Bruk KI tidlig til idémyldring, research og førsteutkast – ikke til siste finish.
- Forstå hva du vil og hvor du vil før du tar i bruk KI, slik at du er i stand til å plukke opp feil raskt og styre den i riktig retning dersom den graver seg ned i en grop.
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
- ***Læring og utvikling:*** Jeg har lært å bruke Github til å samarbeide med et team om å utvikle noe sammen. Jeg har også lært en del om hvordan å samhandle med eller styre KI i utviklingsarbeid. Blant annet, hvordan best presentere feilmeldinger eller bugs til KI for å raskt få den til å forstå rotårsaken og gjøre riktige justeringer, og hvordan bygge opp et prompt for å sørge for at KI-en blir styrt i riktig retning. Jeg er usikker på om jeg har lært noe mer om programmering, da jeg ikke har skrevet koden selv og, som en konsekvens, ikke egentlig vet hva som står i den vår fordi den er KI-generert og -redigert. På den annen side har jeg lært en del om byggesteinene og arkitekturen til en applikasjon som den vi har utviklet, og hvordan man bruker tjenester som blant annet Supabase for å gjøre det mulig. I den forstand har jeg fått oppfylt noe av det jeg ønsket å lære i utgangspunktet. Jeg har en langt bedre forståelse av hva begrepet "applikasjon" egentlig innebærer på et mer teknisk nivå og hvor mange ulike elementer som inngår i dette. 
---

## 8. Vedlegg (valgfritt)

- Skjermbilder av applikasjonen
- Lenke til GitHub repository: https://github.com/IBE160/SG-Awesome-like-KI
- Annen relevant dokumentasjon

---

**Ordantall:** Ca. 4 500 ord

**Forventet lengde:** 3000-5000 ord (avhengig av gruppestørrelse og prosjektets kompleksitet)
