Module.register("MMM-JarvisUI", {
  getDom() {
    const wrapper = document.createElement("div");
    wrapper.id = "jarvis-wrapper";

    const orb = document.createElement("div");
    orb.id = "jarvis-orb";

    wrapper.appendChild(orb);
    return wrapper;
  },

  getStyles() {
    return ["JarvisUI.css"];
  }
});
