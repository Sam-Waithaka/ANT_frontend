# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project52-scripture.spec.ts >> compare verse opens the chapter comparison modal focused on the selected verse
- Location: tests\e2e\project52-scripture.spec.ts:199:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: 'Genesis 1' })
Expected: visible
Error: strict mode violation: getByRole('dialog', { name: 'Genesis 1' }) resolved to 2 elements:
    1) <div role="dialog" aria-modal="false" aria-labelledby="scripture-action-sheet-title" class="pointer-events-none fixed inset-x-0 bottom-6 z-[70] hidden justify-center px-4 md:flex">…</div> aka getByRole('dialog', { name: 'Genesis 1:1 (BSB)' })
    2) <div role="dialog" aria-modal="true" aria-labelledby="comparison-title" class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pb-4 pt-20 backdrop-blur-sm sm:items-center sm:p-4">…</div> aka getByRole('dialog', { name: 'Genesis 1', exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Genesis 1' })

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
              - heading "Genesis 1" [level=1] [ref=e54]
            - generic [ref=e56]:
              - button "1 In the beginning God created the heavens and the earth." [pressed] [ref=e57] [cursor=pointer]:
                - generic [ref=e58]:
                  - generic [ref=e59]: "1"
                  - generic [ref=e60]: In the beginning God created the heavens and the earth.
              - button "2 Now the earth was formless and void." [ref=e61] [cursor=pointer]:
                - generic [ref=e62]:
                  - generic [ref=e63]: "2"
                  - generic [ref=e64]: Now the earth was formless and void.
        - complementary [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]:
              - paragraph [ref=e68]: Bible tools
              - generic [ref=e69]:
                - button "Compare" [ref=e70] [cursor=pointer]
                - button "Resources" [ref=e71] [cursor=pointer]
                - button "Glossary" [ref=e72] [cursor=pointer]
                - button "Markers" [ref=e73] [cursor=pointer]
                - button "Notes" [ref=e74] [cursor=pointer]
              - generic [ref=e75]:
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - button "Genesis" [ref=e79] [cursor=pointer]:
                      - generic [ref=e80]: Genesis
                      - img [ref=e81]
                    - button "1" [ref=e84] [cursor=pointer]:
                      - generic [ref=e85]: "1"
                      - img [ref=e86]
                  - generic [ref=e88]:
                    - paragraph [ref=e89]: Versions
                    - generic [ref=e91]:
                      - generic [ref=e92] [cursor=pointer]:
                        - checkbox "BSB Berean Standard Bible" [checked] [ref=e93]
                        - generic [ref=e94]: BSB
                        - generic [ref=e95]: Berean Standard Bible
                      - generic [ref=e96] [cursor=pointer]:
                        - checkbox "ASV American Standard Version" [checked] [ref=e97]
                        - generic [ref=e98]: ASV
                        - generic [ref=e99]: American Standard Version
                    - paragraph [ref=e100]: Comparing Genesis 1.
                - button "Run comparison" [ref=e101] [cursor=pointer]
              - paragraph [ref=e103]: Run a tool to view API results here.
            - generic [ref=e104]:
              - generic [ref=e105]:
                - img [ref=e107]
                - generic [ref=e109]:
                  - paragraph [ref=e110]: Project 52
                  - heading "Wednesday's Reading" [level=2] [ref=e111]
              - generic [ref=e113]:
                - generic [ref=e114]: Week 18 of 52
                - generic [ref=e115]: 35%
              - generic [ref=e119]:
                - img [ref=e120]
                - generic [ref=e124]: Start. Stay. Finish.
              - generic [ref=e125]:
                - button "OT 1 Samuel 14-15" [ref=e126] [cursor=pointer]:
                  - generic [ref=e127]:
                    - generic [ref=e128]: OT
                    - generic [ref=e129]: 1 Samuel 14-15
                - button "NT John 20" [ref=e130] [cursor=pointer]:
                  - generic [ref=e131]:
                    - generic [ref=e132]: NT
                    - generic [ref=e133]: John 20
              - link "Open Project 52" [ref=e135] [cursor=pointer]:
                - /url: /project52
                - text: Open Project 52
                - img [ref=e136]
  - generic [ref=e138]:
    - button "Previous chapter" [disabled] [ref=e139] [cursor=pointer]:
      - img [ref=e140]
    - generic [ref=e142]:
      - button "BSB" [ref=e144] [cursor=pointer]:
        - generic [ref=e145]: BSB
        - img [ref=e146]
      - button "Genesis" [ref=e149] [cursor=pointer]:
        - generic [ref=e150]: Genesis
        - img [ref=e151]
      - button "1" [ref=e154] [cursor=pointer]:
        - generic [ref=e155]: "1"
        - img [ref=e156]
    - button "Next chapter" [ref=e158] [cursor=pointer]:
      - img [ref=e159]
  - dialog "Genesis 1:1 (BSB)":
    - generic [ref=e161]:
      - generic [ref=e162]:
        - generic [ref=e163]:
          - paragraph [ref=e164]: Scripture actions
          - heading "Genesis 1:1 (BSB)" [level=2] [ref=e165]
          - paragraph [ref=e166]: 1. In the beginning God created the heavens and the earth. Genesis 1
        - generic [ref=e167]:
          - button "Expand Scripture actions" [ref=e168] [cursor=pointer]:
            - img [ref=e169]
          - button "Close Scripture actions" [ref=e171] [cursor=pointer]:
            - img [ref=e172]
      - generic [ref=e176]:
        - button "Copy verse" [ref=e177] [cursor=pointer]:
          - img [ref=e178]
          - text: Copy verse
        - button "Compare verse" [active] [ref=e181] [cursor=pointer]:
          - img [ref=e182]
          - text: Compare verse
  - dialog "Genesis 1" [ref=e189]:
    - generic [ref=e190]:
      - generic [ref=e191]:
        - generic [ref=e192]:
          - paragraph [ref=e193]: Chapter comparison
          - heading "Genesis 1" [level=2] [ref=e194]
          - paragraph [ref=e195]: BSB, ASV
        - button "Close comparison" [ref=e196] [cursor=pointer]:
          - img [ref=e197]
      - generic [ref=e201]:
        - generic [ref=e202]:
          - paragraph [ref=e203]: Verse 1
          - generic [ref=e204]:
            - article [ref=e205]:
              - paragraph [ref=e206]: BSB
              - paragraph [ref=e207]: In the beginning God created the heavens and the earth.
            - article [ref=e208]:
              - paragraph [ref=e209]: ASV
              - paragraph [ref=e210]: In the beginning God created the heavens and the earth.
        - generic [ref=e211]:
          - paragraph [ref=e212]: Verse 2
          - generic [ref=e213]:
            - article [ref=e214]:
              - paragraph [ref=e215]: BSB
              - paragraph [ref=e216]: Now the earth was formless and void.
            - article [ref=e217]:
              - paragraph [ref=e218]: ASV
              - paragraph [ref=e219]: And the earth was waste and void.
```

# Test source

```ts
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
  160 |   await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
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
> 205 |   await expect(page.getByRole('dialog', { name: 'Genesis 1' })).toBeVisible();
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
  206 |   await expect(page.getByRole('heading', { name: 'Genesis 1', exact: true }).last()).toBeVisible();
  207 |   await expect(page.getByText('Verse 1')).toBeVisible();
  208 |   await expect(page.getByText('In the beginning God created the heavens and the earth.')).toBeVisible();
  209 | });
  210 | 
```