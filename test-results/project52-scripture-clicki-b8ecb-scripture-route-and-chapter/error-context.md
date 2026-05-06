# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project52-scripture.spec.ts >> clicking a Project 52 tile opens the correct scripture route and chapter
- Location: tests\e2e\project52-scripture.spec.ts:122:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Early on the first day of the week Mary Magdalene went to the tomb.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Early on the first day of the week Mary Magdalene went to the tomb.')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - link "Open the AIC Njoro Town website" [ref=e6] [cursor=pointer]:
        - /url: https://aicnjoro.org
        - paragraph [ref=e8]:
          - text: A.I.C Njoro
          - text: Town
      - navigation "Site navigation" [ref=e9]:
        - link "Home" [ref=e10] [cursor=pointer]:
          - /url: /
          - img [ref=e11]
          - text: Home
        - link "Scripture" [ref=e14] [cursor=pointer]:
          - /url: /scripture
          - img [ref=e15]
          - text: Scripture
        - link "Project 52" [ref=e17] [cursor=pointer]:
          - /url: /project52
          - img [ref=e18]
          - text: Project 52
        - link "Giving" [ref=e20] [cursor=pointer]:
          - /url: "#"
          - img [ref=e21]
          - text: Giving
      - generic [ref=e23]:
        - link "Settings" [ref=e24] [cursor=pointer]:
          - /url: "#"
          - img [ref=e25]
          - text: Settings
        - button "Dark theme" [ref=e28] [cursor=pointer]:
          - img [ref=e29]
          - text: Dark theme
        - link "Help" [ref=e31] [cursor=pointer]:
          - /url: "#"
          - img [ref=e32]
          - text: Help
    - complementary [ref=e35]:
      - generic [ref=e36]:
        - paragraph [ref=e37]: Books
        - generic [ref=e39]:
          - button "Genesis" [ref=e40] [cursor=pointer]
          - button "1 Samuel" [ref=e41] [cursor=pointer]
          - button "John" [ref=e42] [cursor=pointer]
    - main [ref=e43]:
      - generic [ref=e47]:
        - img
        - searchbox [ref=e48]
      - generic [ref=e49]:
        - article [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]:
              - paragraph [ref=e53]: BSB
              - heading "John 1" [level=1] [ref=e54]
            - status [ref=e56]:
              - paragraph [ref=e57]: No verses found
              - paragraph [ref=e58]: Select a chapter to begin reading.
        - complementary [ref=e59]:
          - generic [ref=e60]:
            - generic [ref=e61]:
              - paragraph [ref=e62]: Bible tools
              - generic [ref=e63]:
                - button "Compare" [ref=e64] [cursor=pointer]
                - button "Resources" [ref=e65] [cursor=pointer]
                - button "Glossary" [ref=e66] [cursor=pointer]
                - button "Markers" [ref=e67] [cursor=pointer]
                - button "Notes" [ref=e68] [cursor=pointer]
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - generic [ref=e71]:
                    - button "John" [ref=e73] [cursor=pointer]:
                      - generic [ref=e74]: John
                      - img [ref=e75]
                    - button "1" [ref=e78] [cursor=pointer]:
                      - generic [ref=e79]: "1"
                      - img [ref=e80]
                  - generic [ref=e82]:
                    - paragraph [ref=e83]: Versions
                    - generic [ref=e85]:
                      - generic [ref=e86] [cursor=pointer]:
                        - checkbox "BSB Berean Standard Bible" [checked] [ref=e87]
                        - generic [ref=e88]: BSB
                        - generic [ref=e89]: Berean Standard Bible
                      - generic [ref=e90] [cursor=pointer]:
                        - checkbox "ASV American Standard Version" [checked] [ref=e91]
                        - generic [ref=e92]: ASV
                        - generic [ref=e93]: American Standard Version
                    - paragraph [ref=e94]: Comparing John 1.
                - button "Run comparison" [ref=e95] [cursor=pointer]
              - paragraph [ref=e97]: Run a tool to view API results here.
            - generic [ref=e98]:
              - generic [ref=e99]:
                - img [ref=e101]
                - generic [ref=e103]:
                  - paragraph [ref=e104]: Project 52
                  - heading "Wednesday's Reading" [level=2] [ref=e105]
              - generic [ref=e107]:
                - generic [ref=e108]: Week 18 of 52
                - generic [ref=e109]: 35%
              - generic [ref=e113]:
                - img [ref=e114]
                - generic [ref=e118]: Open. Read. Obey.
              - generic [ref=e119]:
                - button "OT 1 Samuel 14-15" [ref=e120] [cursor=pointer]:
                  - generic [ref=e121]:
                    - generic [ref=e122]: OT
                    - generic [ref=e123]: 1 Samuel 14-15
                - button "NT John 20" [ref=e124] [cursor=pointer]:
                  - generic [ref=e125]:
                    - generic [ref=e126]: NT
                    - generic [ref=e127]: John 20
              - link "Open Project 52" [ref=e129] [cursor=pointer]:
                - /url: /project52
                - text: Open Project 52
                - img [ref=e130]
  - generic [ref=e132]:
    - button "Previous chapter" [ref=e133] [cursor=pointer]:
      - img [ref=e134]
    - generic [ref=e136]:
      - button "BSB" [ref=e138] [cursor=pointer]:
        - generic [ref=e139]: BSB
        - img [ref=e140]
      - button "John" [ref=e143] [cursor=pointer]:
        - generic [ref=e144]: John
        - img [ref=e145]
      - button "1" [ref=e148] [cursor=pointer]:
        - generic [ref=e149]: "1"
        - img [ref=e150]
    - button "Next chapter" [ref=e152] [cursor=pointer]:
      - img [ref=e153]
```

# Test source

```ts
  29  |     { verse_number: 1, text: 'One day Jonathan son of Saul said to his young armor-bearer.' },
  30  |     { verse_number: 2, text: 'Meanwhile Saul was staying under the pomegranate tree.' },
  31  |   ],
  32  |   'John:20': [
  33  |     { verse_number: 1, text: 'Early on the first day of the week Mary Magdalene went to the tomb.' },
  34  |     { verse_number: 2, text: 'So she came running to Simon Peter and the other disciple.' },
  35  |   ],
  36  | };
  37  | 
  38  | const fulfillJson = async (route: Route, payload: unknown) => {
  39  |   await route.fulfill({
  40  |     status: 200,
  41  |     contentType: 'application/json',
  42  |     body: JSON.stringify(payload),
  43  |   });
  44  | };
  45  | 
  46  | const mockScriptureApi = async (page: Page) => {
  47  |   await page.addInitScript(({ iso }) => {
  48  |     const fixedTime = new Date(iso).getTime();
  49  |     const NativeDate = Date;
  50  | 
  51  |     class MockDate extends NativeDate {
  52  |       constructor(...args: ConstructorParameters<DateConstructor>) {
  53  |         if (args.length === 0) {
  54  |           super(fixedTime);
  55  |           return;
  56  |         }
  57  |         super(...args);
  58  |       }
  59  | 
  60  |       static now() {
  61  |         return fixedTime;
  62  |       }
  63  |     }
  64  | 
  65  |     // @ts-expect-error test override
  66  |     window.Date = MockDate;
  67  |   }, { iso: fixedDateIso });
  68  | 
  69  |   await page.route('**/v1/bible/versions/', async (route) => {
  70  |     await fulfillJson(route, versionsPayload);
  71  |   });
  72  | 
  73  |   await page.route('**/v1/bible/versions/BSB/books/', async (route) => {
  74  |     await fulfillJson(route, booksPayload);
  75  |   });
  76  | 
  77  |   await page.route('**/v1/bible/versions/ASV/books/', async (route) => {
  78  |     await fulfillJson(route, booksPayload);
  79  |   });
  80  | 
  81  |   await page.route('**/v1/bible/versions/*/books/Gen/chapters/', async (route) => {
  82  |     await fulfillJson(route, chapterList(3));
  83  |   });
  84  | 
  85  |   await page.route('**/v1/bible/versions/*/books/1Sam/chapters/', async (route) => {
  86  |     await fulfillJson(route, chapterList(20));
  87  |   });
  88  | 
  89  |   await page.route('**/v1/bible/versions/*/books/John/chapters/', async (route) => {
  90  |     await fulfillJson(route, chapterList(21));
  91  |   });
  92  | 
  93  |   await page.route('**/v1/bible/versions/*/books/*/chapters/*/', async (route) => {
  94  |     const url = new URL(route.request().url());
  95  |     const match = url.pathname.match(/\/books\/([^/]+)\/chapters\/(\d+)\/$/);
  96  | 
  97  |     if (!match) {
  98  |       await route.fallback();
  99  |       return;
  100 |     }
  101 | 
  102 |     const [, book, chapter] = match;
  103 |     const payload = chapterPayloads[`${book}:${chapter}`] ?? [];
  104 |     await fulfillJson(route, payload);
  105 |   });
  106 | };
  107 | 
  108 | test.beforeEach(async ({ page }) => {
  109 |   await mockScriptureApi(page);
  110 | });
  111 | 
  112 | test('clicking the scripture Project 52 widget opens the OT reading directly', async ({ page }) => {
  113 |   await page.goto('/scripture');
  114 | 
  115 |   await expect(page.getByRole('heading', { name: 'Genesis 1' })).toBeVisible();
  116 |   await page.getByRole('button', { name: /1 Samuel 14-15/i }).click();
  117 | 
  118 |   await expect(page.getByRole('heading', { name: '1 Samuel 14' })).toBeVisible();
  119 |   await expect(page.getByText('One day Jonathan son of Saul said to his young armor-bearer.')).toBeVisible();
  120 | });
  121 | 
  122 | test('clicking a Project 52 tile opens the correct scripture route and chapter', async ({ page }) => {
  123 |   await page.goto('/project52');
  124 | 
  125 |   await page.getByRole('button', { name: /john 20/i }).click();
  126 | 
  127 |   await expect(page).toHaveURL(/\/scripture$/);
  128 |   await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
> 129 |   await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
      |                                                                                                       ^ Error: expect(locator).toBeVisible() failed
  130 | });
  131 | 
  132 | test('mobile scripture dock panels close when tapping the backdrop', async ({ page }) => {
  133 |   await page.setViewportSize({ width: 390, height: 844 });
  134 |   await page.goto('/scripture');
  135 | 
  136 |   await page.getByRole('button', { name: /project 52/i }).click();
  137 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();
  138 | 
  139 |   await page.mouse.click(12, 12);
  140 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  141 | });
  142 | 
  143 | test('mobile project 52 panel closes after opening a reading', async ({ page }) => {
  144 |   await page.setViewportSize({ width: 390, height: 844 });
  145 |   await page.goto('/scripture');
  146 | 
  147 |   await page.getByRole('button', { name: /project 52/i }).click();
  148 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();
  149 | 
  150 |   await page.getByRole('button', { name: /john 20/i }).click();
  151 | 
  152 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  153 |   await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  154 |   await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
  155 | });
  156 | 
  157 | test('clicking a verse opens the scripture action sheet', async ({ page }) => {
  158 |   await page.goto('/scripture');
  159 | 
  160 |   await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  161 | 
  162 |   await expect(page.getByRole('dialog')).toBeVisible();
  163 |   await expect(page.getByRole('button', { name: /share verse/i })).toBeVisible();
  164 |   await expect(page.getByRole('button', { name: /copy chapter/i })).toBeVisible();
  165 | });
  166 | 
```