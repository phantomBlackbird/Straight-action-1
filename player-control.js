AFRAME.registerComponent('mobile-player-controller', {
  init: function () {
    const el = this.el;
    this.activeAction = "idle";
    
    // 1. Scale the character as requested
    el.setAttribute('scale', '0.072 0.072 0.072');

    // 2. Attach Gun to Hand Bone
    el.addEventListener('model-loaded', () => {
      const sceneEl = el.object3D;
      const gunEl = document.querySelector('#gun').object3D;
      const handBone = sceneEl.getObjectByName('mixamorigRightHand');

      if (handBone) {
        handBone.add(gunEl);
        gunEl.position.set(0, 0, 0); 
        gunEl.rotation.set(Math.PI / 2, 0, 0);
      }
    });

    // 3. Listen for Touch Button Events
    window.addEventListener('action-start', (e) => { this.activeAction = e.detail.type; });
    window.addEventListener('action-stop', () => { this.activeAction = "idle"; });
  },

  tick: function () {
    const mixer = this.el.getAttribute('animation-mixer');
    let targetAnim = "idle";

    if (this.activeAction === "shoot") {
      targetAnim = "shoot-rifle";
    } else if (this.activeAction === "reload") {
      targetAnim = "reloading";
    } else if (this.activeAction === "move") {
      targetAnim = "run-forward";
      // Forward Movement logic
      const pos = this.el.getAttribute('position');
      pos.z -= 0.05; 
      this.el.setAttribute('position', pos);
    }

    if (mixer.clip !== targetAnim) {
      this.el.setAttribute('animation-mixer', {clip: targetAnim, crossFadeDuration: 0.2});
    }
  }
});

// Simple helper to bridge HTML buttons to A-Frame
function sendAction(type, active) {
  const eventName = active ? 'action-start' : 'action-stop';
  window.dispatchEvent(new CustomEvent(eventName, { detail: { type: type } }));
}
