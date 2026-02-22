AFRAME.registerComponent('mobile-player-controller', {
  init: function () {
    const el = this.el;
    this.activeAction = "idle";
    this.gunAttached = false;
    
    // Scale the character 5 times smaller than before
    // Original was 0.072, now we make it 5x smaller: 0.072 / 5 = 0.0144
    el.setAttribute('scale', '0.0144 0.0144 0.0144');

    // Wait for model to load
    el.addEventListener('model-loaded', () => {
      this.attachGunToHand();
    });
  },

  attachGunToHand: function() {
    if (this.gunAttached) return;
    
    const el = this.el;
    const model = el.getObject3D('mesh');
    if (!model) return;

    // Try different possible hand bone names
    const handBoneNames = [
      'mixamorigRightHand',
      'RightHand',
      'hand_r',
      'Hand_R',
      'Right_Hand',
      'mixamorig:RightHand'
    ];
    
    let handBone = null;
    for (const boneName of handBoneNames) {
      handBone = model.getObjectByName(boneName);
      if (handBone) {
        console.log('Found hand bone:', boneName);
        break;
      }
    }

    if (handBone) {
      // Get the gun entity and its 3D object
      const gunEntity = document.querySelector('#gun');
      const gunModel = gunEntity.getObject3D('mesh');
      
      if (gunModel) {
        // Remove from original parent and add to hand bone
        gunModel.parent.remove(gunModel);
        handBone.add(gunModel);
        
        // Position and rotate the gun relative to the hand
        // Adjusted these values for the smaller scale
        gunModel.position.set(0.02, -0.01, 0.03);
        gunModel.rotation.set(0, Math.PI / 2, 0);
        
        // Scale the gun to match the smaller player size
        // Previously was 0.5, now scale proportionally with player
        gunModel.scale.set(0.1, 0.1, 0.1);
        
        // Make gun visible now that it's attached
        gunEntity.setAttribute('visible', 'true');
        
        this.gunAttached = true;
        console.log('Gun attached to hand successfully');
      } else {
        // If gun model not loaded yet, wait for it
        gunEntity.addEventListener('model-loaded', () => {
          this.attachGunToHand();
        });
      }
    } else {
      console.warn('Hand bone not found, retrying in 1 second...');
      // Retry after a short delay (model might still be loading)
      setTimeout(() => this.attachGunToHand(), 1000);
    }
  },

  tick: function () {
    const el = this.el;
    const mixer = el.components['animation-mixer'];
    let targetAnim = "idle";

    if (this.activeAction === "shoot") {
      targetAnim = "shoot-rifle";
    } else if (this.activeAction === "reload") {
      targetAnim = "reloading";
    } else if (this.activeAction === "move") {
      targetAnim = "run-forward";
      // Forward Movement logic - adjusted speed for smaller scale
      const pos = el.getAttribute('position');
      pos.z -= 0.01; // Reduced movement speed for smaller scale
      el.setAttribute('position', pos);
    }

    // Update animation if changed
    if (mixer && mixer.clip !== targetAnim) {
      el.setAttribute('animation-mixer', {
        clip: targetAnim, 
        crossFadeDuration: 0.2
      });
    }
  }
});
