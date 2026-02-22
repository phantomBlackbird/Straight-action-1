AFRAME.registerComponent('mobile-player-controller', {
  init: function () {
    const el = this.el;
    this.activeAction = "idle";
    
    // Updated Scale: 5 times smaller than 0.072
    el.setAttribute('scale', '0.0144 0.0144 0.0144');

    el.addEventListener('model-loaded', () => {
      const mesh = el.getObject3D('mesh');
      const gun = document.querySelector('#gun').object3D;
      
      // Using the renamed bone from the gltf-transform script
      const handBone = mesh.getObjectByName('Hand_R');

      if (handBone) {
        handBone.add(gun); 
        gun.position.set(0, 0, 0); 
        gun.rotation.set(Math.PI / 2, 0, 0);
        // Ensure gun is scaled appropriately to the tiny player
        gun.scale.set(1, 1, 1); 
      }
    });

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
      const pos = this.el.getAttribute('position');
      pos.z -= 0.02; // Adjusted speed for smaller scale
      this.el.setAttribute('position', pos);
    }

    if (mixer && mixer.clip !== targetAnim) {
      this.el.setAttribute('animation-mixer', {clip: targetAnim, crossFadeDuration: 0.2});
    }
  }
});

function sendAction(type, active) {
  const eventName = active ? 'action-start' : 'action-stop';
  window.dispatchEvent(new CustomEvent(eventName, { detail: { type: type } }));
}
