import { test, expect } from "@playwright/test";

test("contact form shows success message on submit", async ({ page }) => {
  // API呼び出しをインターセプトしてモックレスポンスを返す
  await page.route("**/contact", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByText("Contact").click();
  await page.getByRole("textbox", { name: "Name:" }).fill("test");
  await page.getByRole("textbox", { name: "Email:" }).fill("test@test.com");
  await page.getByRole("textbox", { name: "Message:" }).fill("test message");

  const dialogPromise = page.waitForEvent("dialog");
  await page.getByRole("button", { name: "Send" }).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("successfully");
  await dialog.dismiss();
});

test("contact form shows error message on API failure", async ({ page }) => {
  // APIエラーをシミュレート
  await page.route("**/contact", (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ success: false }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByText("Contact").click();
  await page.getByRole("textbox", { name: "Name:" }).fill("test");
  await page.getByRole("textbox", { name: "Email:" }).fill("test@test.com");
  await page.getByRole("textbox", { name: "Message:" }).fill("test message");

  const dialogPromise = page.waitForEvent("dialog");
  await page.getByRole("button", { name: "Send" }).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("error");
  await dialog.dismiss();
});
