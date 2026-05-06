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
          - generic [ref=e52]:
            - paragraph [ref=e53]: BSB
            - heading "John 1" [level=1] [ref=e54]
        - complementary [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - paragraph [ref=e85]: Bible tools
              - generic [ref=e86]:
                - button "Compare" [ref=e87] [cursor=pointer]
                - button "Resources" [ref=e88] [cursor=pointer]
                - button "Glossary" [ref=e89] [cursor=pointer]
                - button "Markers" [ref=e90] [cursor=pointer]
                - button "Notes" [ref=e91] [cursor=pointer]
              - generic [ref=e92]:
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - button "John" [ref=e96] [cursor=pointer]:
                      - generic [ref=e97]: John
                      - img [ref=e98]
                    - button "1" [ref=e101] [cursor=pointer]:
                      - generic [ref=e102]: "1"
                      - img [ref=e103]
                  - generic [ref=e105]:
                    - paragraph [ref=e106]: Versions
                    - generic [ref=e108]:
                      - generic [ref=e109] [cursor=pointer]:
                        - checkbox "BSB Berean Standard Bible" [checked] [ref=e110]
                        - generic [ref=e111]: BSB
                        - generic [ref=e112]: Berean Standard Bible
                      - generic [ref=e113] [cursor=pointer]:
                        - checkbox "ASV American Standard Version" [checked] [ref=e114]
                        - generic [ref=e115]: ASV
                        - generic [ref=e116]: American Standard Version
                    - paragraph [ref=e117]: Comparing John 1.
                - button "Run comparison" [ref=e118] [cursor=pointer]
              - paragraph [ref=e120]: Run a tool to view API results here.
            - generic [ref=e121]:
              - generic [ref=e122]:
                - img [ref=e124]
                - generic [ref=e126]:
                  - paragraph [ref=e127]: Project 52
                  - heading "Wednesday's Reading" [level=2] [ref=e128]
              - generic [ref=e130]:
                - generic [ref=e131]: Week 18 of 52
                - generic [ref=e132]: 35%
              - generic [ref=e136]:
                - img [ref=e137]
                - generic [ref=e141]: Still Reading. Still Believing.
              - generic [ref=e142]:
                - button "OT 1 Samuel 14-15" [ref=e143] [cursor=pointer]:
                  - generic [ref=e144]:
                    - generic [ref=e145]: OT
                    - generic [ref=e146]: 1 Samuel 14-15
                - button "NT John 20" [ref=e147] [cursor=pointer]:
                  - generic [ref=e148]:
                    - generic [ref=e149]: NT
                    - generic [ref=e150]: John 20
              - link "Open Project 52" [ref=e152] [cursor=pointer]:
                - /url: /project52
                - text: Open Project 52
                - img [ref=e153]
  - generic [ref=e155]:
    - button "Previous chapter" [ref=e156] [cursor=pointer]:
      - img [ref=e157]
    - generic [ref=e159]:
      - button "BSB" [ref=e161] [cursor=pointer]:
        - generic [ref=e162]: BSB
        - img [ref=e163]
      - button "John" [ref=e166] [cursor=pointer]:
        - generic [ref=e167]: John
        - img [ref=e168]
      - button "1" [ref=e171] [cursor=pointer]:
        - generic [ref=e172]: "1"
        - img [ref=e173]
    - button "Next chapter" [ref=e175] [cursor=pointer]:
      - img [ref=e176]
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
```