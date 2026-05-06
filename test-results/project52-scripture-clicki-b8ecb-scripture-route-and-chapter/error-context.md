# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project52-scripture.spec.ts >> clicking a Project 52 tile opens the correct scripture route and chapter
- Location: tests\e2e\project52-scripture.spec.ts:153:1

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
                - generic [ref=e118]: Truth That Transforms
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
  60  | 
  61  | const fulfillJson = async (route: Route, payload: unknown) => {
  62  |   await route.fulfill({
  63  |     status: 200,
  64  |     contentType: 'application/json',
  65  |     body: JSON.stringify(payload),
  66  |   });
  67  | };
  68  | 
  69  | const mockScriptureApi = async (page: Page) => {
  70  |   await page.addInitScript(({ iso }) => {
  71  |     const fixedTime = new Date(iso).getTime();
  72  |     const NativeDate = Date;
  73  | 
  74  |     class MockDate extends NativeDate {
  75  |       constructor(...args: ConstructorParameters<DateConstructor>) {
  76  |         if (args.length === 0) {
  77  |           super(fixedTime);
  78  |           return;
  79  |         }
  80  |         super(...args);
  81  |       }
  82  | 
  83  |       static now() {
  84  |         return fixedTime;
  85  |       }
  86  |     }
  87  | 
  88  |     // @ts-expect-error test override
  89  |     window.Date = MockDate;
  90  |   }, { iso: fixedDateIso });
  91  | 
  92  |   await page.route('**/v1/bible/versions/', async (route) => {
  93  |     await fulfillJson(route, versionsPayload);
  94  |   });
  95  | 
  96  |   await page.route('**/v1/bible/versions/BSB/books/', async (route) => {
  97  |     await fulfillJson(route, booksPayload);
  98  |   });
  99  | 
  100 |   await page.route('**/v1/bible/versions/ASV/books/', async (route) => {
  101 |     await fulfillJson(route, booksPayload);
  102 |   });
  103 | 
  104 |   await page.route('**/v1/bible/versions/*/books/Gen/chapters/', async (route) => {
  105 |     await fulfillJson(route, chapterList(3));
  106 |   });
  107 | 
  108 |   await page.route('**/v1/bible/versions/*/books/1Sam/chapters/', async (route) => {
  109 |     await fulfillJson(route, chapterList(20));
  110 |   });
  111 | 
  112 |   await page.route('**/v1/bible/versions/*/books/John/chapters/', async (route) => {
  113 |     await fulfillJson(route, chapterList(21));
  114 |   });
  115 | 
  116 |   await page.route('**/v1/bible/versions/*/books/*/chapters/*/', async (route) => {
  117 |     const url = new URL(route.request().url());
  118 |     const match = url.pathname.match(/\/books\/([^/]+)\/chapters\/(\d+)\/$/);
  119 | 
  120 |     if (!match) {
  121 |       await route.fallback();
  122 |       return;
  123 |     }
  124 | 
  125 |     const [, book, chapter] = match;
  126 |     const payload = chapterPayloads[`${book}:${chapter}`] ?? [];
  127 |     await fulfillJson(route, payload);
  128 |   });
  129 | 
  130 |   await page.route('**/v1/bible/compare/**', async (route) => {
  131 |     const url = new URL(route.request().url());
  132 |     const book = url.searchParams.get('book') || '';
  133 |     const chapter = url.searchParams.get('chapter') || '';
  134 |     const payload = comparisonPayloads[`${book}:${chapter}`] ?? { book, chapter: Number(chapter), results: [] };
  135 |     await fulfillJson(route, payload);
  136 |   });
  137 | };
  138 | 
  139 | test.beforeEach(async ({ page }) => {
  140 |   await mockScriptureApi(page);
  141 | });
  142 | 
  143 | test('clicking the scripture Project 52 widget opens the OT reading directly', async ({ page }) => {
  144 |   await page.goto('/scripture');
  145 | 
  146 |   await expect(page.getByRole('heading', { name: 'Genesis 1' })).toBeVisible();
  147 |   await page.getByRole('button', { name: /1 Samuel 14-15/i }).click();
  148 | 
  149 |   await expect(page.getByRole('heading', { name: '1 Samuel 14' })).toBeVisible();
  150 |   await expect(page.getByText('One day Jonathan son of Saul said to his young armor-bearer.')).toBeVisible();
  151 | });
  152 | 
  153 | test('clicking a Project 52 tile opens the correct scripture route and chapter', async ({ page }) => {
  154 |   await page.goto('/project52');
  155 | 
  156 |   await page.getByRole('button', { name: /john 20/i }).click();
  157 | 
  158 |   await expect(page).toHaveURL(/\/scripture$/);
  159 |   await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
> 160 |   await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
      |                                                                                                       ^ Error: expect(locator).toBeVisible() failed
  161 | });
  162 | 
  163 | test('mobile scripture dock panels close when tapping the backdrop', async ({ page }) => {
  164 |   await page.setViewportSize({ width: 390, height: 844 });
  165 |   await page.goto('/scripture');
  166 | 
  167 |   await page.getByRole('button', { name: /project 52/i }).click();
  168 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();
  169 | 
  170 |   await page.mouse.click(12, 12);
  171 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  172 | });
  173 | 
  174 | test('mobile project 52 panel closes after opening a reading', async ({ page }) => {
  175 |   await page.setViewportSize({ width: 390, height: 844 });
  176 |   await page.goto('/scripture');
  177 | 
  178 |   await page.getByRole('button', { name: /project 52/i }).click();
  179 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();
  180 | 
  181 |   await page.getByRole('button', { name: /john 20/i }).click();
  182 | 
  183 |   await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  184 |   await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  185 |   await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
  186 | });
  187 | 
  188 | test('clicking a verse opens the scripture action sheet', async ({ page }) => {
  189 |   await page.goto('/scripture');
  190 | 
  191 |   await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  192 | 
  193 |   await expect(page.getByRole('dialog')).toBeVisible();
  194 |   await expect(page.getByRole('button', { name: /copy verse/i })).toBeVisible();
  195 |   await expect(page.getByRole('button', { name: /compare verse/i })).toBeVisible();
  196 |   await expect(page.getByRole('button', { name: /collapse scripture actions|expand scripture actions/i })).toBeVisible();
  197 | });
  198 | 
  199 | test('compare verse opens the chapter comparison modal focused on the selected verse', async ({ page }) => {
  200 |   await page.goto('/scripture');
  201 | 
  202 |   await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  203 |   await page.getByRole('button', { name: /compare verse/i }).click();
  204 | 
  205 |   await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toBeVisible();
  206 |   await expect(page.getByRole('heading', { name: 'Genesis 1', exact: true }).last()).toBeVisible();
  207 |   await expect(page.getByText('Verse 1')).toBeVisible();
  208 |   await expect(page.getByText('In the beginning God created the heavens and the earth.')).toBeVisible();
  209 | });
  210 | 
```