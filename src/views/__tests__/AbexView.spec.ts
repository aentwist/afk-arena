import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
import { config, mount, type VueWrapper } from "@vue/test-utils";
import vuetify from "@/plugins/vuetify";
import AbexView from "../AbexView.vue";

config.global.plugins = [vuetify];

const clickCalculate = async (wrapper: VueWrapper) =>
  await wrapper
    .findAll("button")
    ?.find((elt) => elt.text().includes("Calculate"))
    ?.trigger("click");

describe("AbexView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("navigates to the results page when clicking Calculate", async () => {
    vi.useRealTimers();

    const wrapper = mount(AbexView);

    await clickCalculate(wrapper);
    const text = wrapper.text();
    expect(text).not.toContain("Calculate");
    expect(text).toContain("hours");
    expect(text).toContain("Back");
  });

  it("navigates back to the input page when clicking Back", async () => {
    vi.useRealTimers();

    const wrapper = mount(AbexView);

    await wrapper
      .findAll("button")
      ?.find((elt) => elt.text().includes("Back"))
      ?.trigger("click");
    const text = wrapper.text();
    expect(text).not.toContain("Back");
    expect(text).toContain("Spectators");
    expect(text).toContain("Calculate");
  });

  describe("hours remaining until quiet time", () => {
    test("before reaching quiet time", async () => {
      vi.setSystemTime("2023-05-21T00:00Z");

      const wrapper = mount(AbexView);

      await clickCalculate(wrapper);
      expect(wrapper.text()).toContain("24 hours left");
    });

    test("after reaching quiet time", async () => {
      vi.setSystemTime("2023-05-22T01:00Z");

      const wrapper = mount(AbexView);

      await clickCalculate(wrapper);
      expect(wrapper.text()).toContain("-1 hours left");
    });
  });

  describe("stamina yet to accrue", () => {
    test("with 10 hours remaining until quiet time", async () => {
      vi.setSystemTime("2023-05-21T14:00Z");

      const wrapper = mount(AbexView);

      await clickCalculate(wrapper);
      expect(wrapper.text()).toContain("will accrue 40 more stamina");
    });

    test("after quiet time", async () => {
      vi.setSystemTime("2023-05-22T00:29Z");

      const wrapper = mount(AbexView);

      await clickCalculate(wrapper);
      expect(wrapper.text()).toContain("will accrue 0 more stamina");
    });

    test("as a spectated SoD is 10% more", async () => {
      vi.setSystemTime("2023-05-21T14:00Z");

      const wrapper = mount(AbexView, {
        attachTo: document.body,
      });

      await wrapper.get('[data-test="spectated"] input').trigger("click");
      await clickCalculate(wrapper);

      expect(wrapper.text()).toContain("will accrue 44 more stamina");
    });

    test("with 5 spectators is 5 * 1.2% more", async () => {
      vi.setSystemTime("2023-05-21T14:00Z");

      const wrapper = mount(AbexView);

      await wrapper.get('[data-test="spectators"] input').setValue(5);
      await clickCalculate(wrapper);

      // 5 * 1.2% = 6%
      // 40 * 1.06 = 42.4
      // floor(42.4) = 42
      expect(wrapper.text()).toContain("will accrue 42 more stamina");
    });
  });

  test.todo("number of attacks");

  test.todo("number of resets");
});
