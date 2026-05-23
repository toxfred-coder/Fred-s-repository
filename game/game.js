// =====================================================
//  Fred's Adventure — Phaser 3 platformer
//  Protagonist: Freddie (white top, blue jeans girl)
// =====================================================

const W = 800, H = 480;
const GRAVITY = 600;
const PLAYER_SPEED = 180;
const JUMP_VEL = -420;

// ── Pixel-art sprite generator (drawn on canvas, converted to texture) ──────

function makeTex(scene, key, w, h, drawFn) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Draws a pixel grid from a 2-char-per-pixel palette string
function pixelSprite(g, pixels, palette, pw = 3) {
  const cols = pixels[0].length;
  pixels.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = palette[row[x]];
      if (!c) continue;
      g.fillStyle(c, 1);
      g.fillRect(x * pw, y * pw, pw, pw);
    }
  });
}

// ── Scene: Boot (generate all textures) ──────────────────────────────────────

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this.createPlayerTextures();
    this.createEnemyTextures();
    this.createTileTextures();
    this.createItemTextures();
    this.createBGTextures();
    this.scene.start('Game');
  }

  createPlayerTextures() {
    const palette = {
      S: 0xffd9b3,  // skin
      H: 0x8b3a8b,  // hair (dark purple/brown)
      T: 0xf5f0e8,  // shirt (white-ish)
      J: 0x5b8fd4,  // jeans (blue)
      E: 0xffffff,  // eyes white
      P: 0xff9fb3,  // lips/cheeks
      N: 0x222222,  // outline
      '0': null,    // transparent
      B: 0xf0e8d0,  // shoe
    };

    // idle frame 1
    const idle1 = [
      '00NNNNN000',
      '0NHHHHHNN0',
      '0NHSHSHNN0',// hair+skin
      '0NSSSSNN00',
      '00NSSPNN00',// face
      '0NTTTTTN00',// shirt
      '0NTTTTTNN0',
      '0NJJJJJNN0',// jeans
      '0NJJJJJNN0',
      '00NBBNBBN0',// shoes
    ];

    // idle frame 2 (slight bob)
    const idle2 = [
      '000NNNNN00',
      '00NHHHHHNN',
      '00NHSHSHNN',
      '00NSSSSNN0',
      '000NSSPNN0',
      '00NTTTTTN0',
      '00NTTTTTNN',
      '00NJJJJJNN',
      '00NJJJJJNN',
      '000NBBNBBN',
    ];

    // run frame 1
    const run1 = [
      '00NNNNN000',
      '0NHHHHHNN0',
      '0NHSHSHNN0',
      '0NSSSSNN00',
      '00NSSPNN00',
      '0NTTTTTN00',
      '0NTTTTTNN0',
      '0NJNJJJNN0',
      '00NJJNJNN0',
      '00NB00NBN0',
    ];

    // run frame 2
    const run2 = [
      '00NNNNN000',
      '0NHHHHHNN0',
      '0NHSHSHNN0',
      '0NSSSSNN00',
      '00NSSPNN00',
      '0NTTTTTN00',
      '0NTTTTTNN0',
      '0NJJJNJNN0',
      '0NJNJJNN00',
      '0NB0NBN000',
    ];

    // jump frame
    const jump = [
      '00NNNNN000',
      '0NHHHHHNN0',
      '0NHSHSHNN0',
      '0NSSSSNN00',
      '00NSSPNN00',
      '00NTTTTNN0',
      '0NTTTTTTNN',
      '00NJJJJNN0',
      '0NJNN0NJN0',
      '0NB000NBN0',
    ];

    const frames = { idle1, idle2, run1, run2, jump };
    const PW = 4;
    const FW = 10 * PW, FH = 10 * PW;

    Object.entries(frames).forEach(([name, pixels]) => {
      if (this.textures.exists('player_' + name)) return;
      const g = this.make.graphics({ add: false });
      pixelSprite(g, pixels, palette, PW);
      g.generateTexture('player_' + name, FW, FH);
      g.destroy();
    });

    // Register spritesheet-like frames via atlas
    this.anims.create({
      key: 'player_idle',
      frames: [
        { key: 'player_idle1' },
        { key: 'player_idle2' },
      ],
      frameRate: 3,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_run',
      frames: [
        { key: 'player_run1' },
        { key: 'player_run2' },
      ],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player_jump' }],
      frameRate: 1,
      repeat: -1,
    });
  }

  createEnemyTextures() {
    // Slime enemy (round, green)
    const slimeP = {
      N: 0x222222, G: 0x4caf50, g: 0x81c784,
      E: 0xffffff, R: 0xef5350, '0': null
    };
    const slime1 = [
      '00NNNNN00',
      '0NGGGGGN0',
      '0NGgGgGN0',
      '0NGNENRN0',
      '0NGGGGNN0',
      '0NNNNNN00',
      '0NG00GNN0',
    ];
    const slime2 = [
      '00NNNNN00',
      '0NGGGGGN0',
      '0NGgGgGN0',
      '0NGNENRN0',
      '00NGGNN00',
      '0NGGGGGN0',
      '00NNNNN00',
    ];
    [{ k: 'slime1', px: slime1 }, { k: 'slime2', px: slime2 }].forEach(({ k, px }) => {
      if (this.textures.exists(k)) return;
      const g = this.make.graphics({ add: false });
      pixelSprite(g, px, slimeP, 5);
      g.generateTexture(k, 45, 35);
      g.destroy();
    });
    this.anims.create({ key: 'slime_walk', frames: [{ key: 'slime1' }, { key: 'slime2' }], frameRate: 4, repeat: -1 });

    // Flying bat
    const batP = { N: 0x222222, B: 0x7b1fa2, b: 0xba68c8, E: 0xff1744, '0': null };
    const bat1 = [
      'B0N0B000B',
      'BNN0BNNBB',
      'BBBNNNNBB',
      '0NBBBBN00',
      '00NEBEN00',
      '000NBN000',
    ];
    const bat2 = [
      '000N00000',
      'BNBNbNBNB',
      'BBBBNNNBB',
      '0NBBBBN00',
      '00NEBEN00',
      '000NBN000',
    ];
    [{ k: 'bat1', px: bat1 }, { k: 'bat2', px: bat2 }].forEach(({ k, px }) => {
      if (this.textures.exists(k)) return;
      const g = this.make.graphics({ add: false });
      pixelSprite(g, px, batP, 5);
      g.generateTexture(k, 45, 30);
      g.destroy();
    });
    this.anims.create({ key: 'bat_fly', frames: [{ key: 'bat1' }, { key: 'bat2' }], frameRate: 8, repeat: -1 });
  }

  createTileTextures() {
    // Ground tile
    if (!this.textures.exists('ground')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x8B4513); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x228B22); g.fillRect(0, 0, 32, 8);
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeRect(0, 0, 32, 32);
      g.fillStyle(0xa0522d); g.fillRect(4, 12, 10, 8); g.fillRect(18, 20, 10, 8);
      g.generateTexture('ground', 32, 32); g.destroy();
    }
    // Brick tile
    if (!this.textures.exists('brick')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xc0392b); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0xe74c3c);
      g.fillRect(1, 1, 14, 14); g.fillRect(17, 1, 14, 14);
      g.fillRect(1, 17, 14, 14); g.fillRect(17, 17, 14, 14);
      g.lineStyle(2, 0x922b21); g.strokeRect(0, 0, 32, 32);
      g.generateTexture('brick', 32, 32); g.destroy();
    }
    // Question block
    if (!this.textures.exists('qblock')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf39c12); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0xf1c40f); g.fillRect(2, 2, 28, 28);
      g.fillStyle(0xe67e22);
      g.fillRect(12, 6, 8, 6); g.fillRect(12, 14, 8, 4); g.fillRect(12, 22, 8, 4);
      g.generateTexture('qblock', 32, 32); g.destroy();
    }
    // Used block
    if (!this.textures.exists('usedblock')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x7f8c8d); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x95a5a6); g.fillRect(2, 2, 28, 28);
      g.generateTexture('usedblock', 32, 32); g.destroy();
    }
    // Platform tile
    if (!this.textures.exists('platform')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x2ecc71); g.fillRect(0, 0, 32, 16);
      g.fillStyle(0x27ae60); g.fillRect(0, 12, 32, 4);
      g.lineStyle(1, 0x1a8a47); g.strokeRect(0, 0, 32, 16);
      g.generateTexture('platform', 32, 16); g.destroy();
    }
    // Pipe
    if (!this.textures.exists('pipe_top')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x27ae60); g.fillRect(0, 0, 64, 32);
      g.fillStyle(0x2ecc71); g.fillRect(4, 4, 56, 24);
      g.fillStyle(0x1e8449); g.fillRect(0, 28, 64, 4);
      g.generateTexture('pipe_top', 64, 32); g.destroy();
    }
    if (!this.textures.exists('pipe_body')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x27ae60); g.fillRect(4, 0, 56, 64);
      g.fillStyle(0x2ecc71); g.fillRect(8, 0, 12, 64);
      g.generateTexture('pipe_body', 64, 64); g.destroy();
    }
  }

  createItemTextures() {
    // Coin
    if (!this.textures.exists('coin')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf1c40f); g.fillCircle(12, 12, 12);
      g.fillStyle(0xf39c12); g.fillCircle(12, 12, 9);
      g.fillStyle(0xf1c40f);
      g.fillRect(9, 5, 6, 14);
      g.generateTexture('coin', 24, 24); g.destroy();
    }
    // Star
    if (!this.textures.exists('star')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffeb3b);
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const b = a + (2 * Math.PI) / 10;
        pts.push({ x: 16 + 13 * Math.cos(a), y: 16 + 13 * Math.sin(a) });
        pts.push({ x: 16 + 6 * Math.cos(b), y: 16 + 6 * Math.sin(b) });
      }
      g.fillPoints(pts, true);
      g.generateTexture('star', 32, 32); g.destroy();
    }
    // Mushroom power-up
    if (!this.textures.exists('mushroom')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xe74c3c); g.fillCircle(16, 14, 14);
      g.fillStyle(0xecf0f1); g.fillRect(4, 18, 24, 14);
      g.fillStyle(0xffffff); g.fillCircle(8, 10, 4); g.fillCircle(24, 10, 4);
      g.fillStyle(0x2c3e50); g.fillCircle(12, 20, 3); g.fillCircle(20, 20, 3);
      g.generateTexture('mushroom', 32, 32); g.destroy();
    }
    // Flag pole
    if (!this.textures.exists('flag_pole')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xbdc3c7); g.fillRect(14, 0, 4, 320);
      g.fillStyle(0x2ecc71); g.fillRect(18, 10, 24, 18);
      g.generateTexture('flag_pole', 64, 320); g.destroy();
    }
    // Particle
    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf1c40f); g.fillRect(0, 0, 6, 6);
      g.generateTexture('particle', 6, 6); g.destroy();
    }
  }

  createBGTextures() {
    // Sky gradient bg
    if (!this.textures.exists('sky')) {
      const g = this.make.graphics({ add: false });
      for (let y = 0; y < H; y++) {
        const r = Phaser.Math.Linear(0x87, 0x4a, y / H);
        const gr = Phaser.Math.Linear(0xce, 0x90, y / H);
        const b = Phaser.Math.Linear(0xeb, 0xff, y / H);
        g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b)); g.fillRect(0, y, W * 3, 1);
      }
      // Clouds
      const cloud = (cx, cy, s) => {
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(cx, cy, s * 0.8);
        g.fillCircle(cx + s, cy, s);
        g.fillCircle(cx + s * 2, cy, s * 0.8);
        g.fillCircle(cx + s * 0.5, cy - s * 0.6, s * 0.7);
        g.fillCircle(cx + s * 1.5, cy - s * 0.7, s * 0.8);
      };
      cloud(80, 80, 30); cloud(300, 60, 25); cloud(600, 90, 35);
      cloud(900, 70, 28); cloud(1200, 85, 32); cloud(1600, 65, 27);
      cloud(2000, 80, 30); cloud(2400, 75, 26);
      // Mountains
      g.fillStyle(0x6a8fa0, 0.5);
      [[100, H - 100, 150], [400, H - 120, 200], [700, H - 90, 130],
       [1000, H - 110, 180], [1400, H - 100, 160], [1800, H - 130, 200]].forEach(([x, y, s]) => {
        g.fillTriangle(x, y, x - s, H, x + s, H);
      });
      g.generateTexture('sky', W * 3, H); g.destroy();
    }
  }
}

// ── Scene: Game ───────────────────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init() {
    this.score = 0;
    this.lives = 3;
    this.coinCount = 0;
    this.invincible = false;
    this.levelNum = 1;
  }

  create() {
    this.cameras.main.setBackgroundColor('#87ceeb');

    // World bounds
    const WORLD_W = 3200;
    this.physics.world.setBounds(0, 0, WORLD_W, H + 200);

    // Background parallax layers
    this.bg = this.add.tileSprite(0, 0, WORLD_W, H, 'sky').setOrigin(0).setScrollFactor(0.2);

    this.buildLevel(WORLD_W);
    this.createPlayer();
    this.createEnemies();
    this.createItems();
    this.createUI();
    this.createCamera(WORLD_W);
    this.setupControls();
    this.setupCollisions();

    // Death zone
    this.deathY = H + 100;
  }

  buildLevel(WORLD_W) {
    this.ground = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();
    this.bricks = this.physics.add.staticGroup();
    this.qblocks = this.physics.add.staticGroup();
    this.pipes = this.physics.add.staticGroup();
    this.flagGroup = this.physics.add.staticGroup();

    const T = 32; // tile size
    const groundY = H - T;

    // ── Ground sections (with gaps) ──
    const groundSections = [
      [0, 40],
      [43, 70],
      [73, 100],
      [103, 160],
    ];
    groundSections.forEach(([from, to]) => {
      for (let x = from * T; x < to * T; x += T) {
        this.ground.create(x + T / 2, groundY + T / 2, 'ground').refreshBody();
      }
    });

    // ── Elevated platforms ──
    const platDefs = [
      // [x, y, width] in tiles
      [5, 8, 3], [10, 6, 4], [15, 8, 3],
      [22, 6, 3], [27, 4, 4], [33, 6, 3],
      [38, 8, 2], [42, 6, 3], [48, 7, 3],
      [55, 5, 4], [60, 6, 3], [67, 7, 3],
      [72, 5, 3], [78, 6, 4], [85, 7, 3],
      [90, 5, 2], [95, 6, 3], [100, 7, 3],
    ];
    platDefs.forEach(([tx, ty, tw]) => {
      for (let i = 0; i < tw; i++) {
        this.platforms.create((tx + i) * T + T / 2, ty * T + 8, 'platform').refreshBody();
      }
    });

    // ── Question blocks ──
    const qbDefs = [
      [6, 6], [11, 4], [28, 2], [45, 5], [56, 3], [79, 4], [96, 4],
    ];
    qbDefs.forEach(([tx, ty]) => {
      const b = this.qblocks.create(tx * T + T / 2, ty * T + T / 2, 'qblock');
      b.setData('item', Phaser.Math.RND.pick(['coin', 'mushroom', 'star']));
      b.refreshBody();
    });

    // ── Brick rows ──
    const brickDefs = [
      [8, 6, 3], [14, 6, 2], [24, 4, 4], [35, 5, 3], [50, 6, 3],
      [63, 5, 4], [75, 5, 2], [88, 5, 3], [98, 5, 4],
    ];
    brickDefs.forEach(([tx, ty, tw]) => {
      for (let i = 0; i < tw; i++) {
        this.bricks.create((tx + i) * T + T / 2, ty * T + T / 2, 'brick').refreshBody();
      }
    });

    // ── Pipes ──
    [[18, groundY], [32, groundY], [47, groundY], [62, groundY], [77, groundY], [97, groundY]].forEach(([tx, y]) => {
      this.pipes.create(tx * T + 32, y - 16, 'pipe_top').setScale(1).refreshBody();
      this.pipes.create(tx * T + 32, y + 32, 'pipe_body').refreshBody();
    });

    // ── Flag at end ──
    this.flagGroup.create(WORLD_W - 80, H - 320 - 16, 'flag_pole').refreshBody();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(80, H - 120, 'player_idle1');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(0);
    this.player.body.setSize(28, 36);
    this.player.setDepth(10);
    this.isOnGround = false;
    this.canDoubleJump = false;
    this.hasStar = false;
    this.bigMode = false;
  }

  createEnemies() {
    this.enemies = this.physics.add.group();

    const slimePositions = [
      400, 640, 960, 1280, 1600, 1920, 2240, 2560,
    ];
    slimePositions.forEach(x => {
      const e = this.enemies.create(x, H - 80, 'slime1');
      e.setData('type', 'slime');
      e.setVelocityX(-60);
      e.play('slime_walk');
      e.body.setSize(36, 28);
    });

    // Bats (flying)
    const batPositions = [550, 900, 1350, 1750, 2100, 2500];
    batPositions.forEach(x => {
      const b = this.enemies.create(x, H - 200, 'bat1');
      b.setData('type', 'bat');
      b.setData('startY', H - 200);
      b.setData('t', Math.random() * Math.PI * 2);
      b.play('bat_fly');
      b.body.allowGravity = false;
      b.body.setSize(36, 22);
    });
  }

  createItems() {
    this.coins = this.physics.add.staticGroup();
    this.powerups = this.physics.add.group();

    // Coin rows
    const coinRows = [
      [5, 5, 5], [10, 4, 6], [22, 5, 4], [38, 7, 3],
      [55, 4, 5], [67, 6, 4], [85, 6, 4], [95, 5, 5],
    ];
    coinRows.forEach(([tx, ty, cnt]) => {
      for (let i = 0; i < cnt; i++) {
        this.coins.create((tx + i) * 32 + 16, ty * 32, 'coin').refreshBody();
      }
    });

    // Floating star
    const s = this.powerups.create(27 * 32, 3 * 32, 'star');
    s.setData('type', 'star');
    s.body.allowGravity = false;
  }

  createUI() {
    this.scoreText = this.add.text(16, 12, 'SCORE: 0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(20);

    this.livesText = this.add.text(W - 130, 12, '♥ x3', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff69b4',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(20);

    this.coinText = this.add.text(W / 2 - 50, 12, '🪙 x0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(20);

    // Star power overlay
    this.starOverlay = this.add.rectangle(0, 0, W, H, 0xffff00, 0)
      .setOrigin(0).setScrollFactor(0).setDepth(19);
  }

  createCamera(WORLD_W) {
    this.cameras.main.setBounds(0, 0, WORLD_W, H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  setupCollisions() {
    const allSolid = [this.ground, this.platforms, this.bricks, this.qblocks, this.pipes];

    // Player on ground
    allSolid.forEach(g => this.physics.add.collider(this.player, g));

    // Enemy on ground
    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.enemies, this.platforms);

    // Player collect coin
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    // Player collect powerup
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

    // Player hit enemy
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // Player hit question block (from below)
    allSolid.forEach(g => {
      this.physics.add.collider(this.player, g, (player, tile) => {
        if (tile.texture && tile.texture.key === 'qblock' && player.body.velocity.y < 0 &&
            player.y > tile.y) {
          this.hitQBlock(tile);
        }
      });
    });

    // Flag
    this.physics.add.overlap(this.player, this.flagGroup, this.reachFlag, null, this);

    // Enemy reversal at world edges
    this.physics.world.on('worldbounds', () => {});
  }

  collectCoin(player, coin) {
    coin.destroy();
    this.coinCount++;
    this.score += 100;
    this.updateUI();
    this.showFloatText(coin.x, coin.y, '+100', '#f1c40f');
    if (this.coinCount % 10 === 0) this.lives++;
    this.cameras.main.shake(60, 0.003);
  }

  collectPowerup(player, powerup) {
    const type = powerup.getData('type');
    powerup.destroy();
    if (type === 'mushroom') {
      this.bigMode = true;
      this.player.setScale(1.3);
      this.score += 500;
      this.showFloatText(player.x, player.y, '+500 BIG!', '#e74c3c');
    } else if (type === 'star') {
      this.hasStar = true;
      this.score += 1000;
      this.showFloatText(player.x, player.y, 'STAR! ★', '#f1c40f');
      this.starOverlay.setAlpha(0.15);
      this.time.delayedCall(8000, () => {
        this.hasStar = false;
        this.starOverlay.setAlpha(0);
      });
    }
    this.updateUI();
  }

  hitEnemy(player, enemy) {
    if (this.invincible) return;

    // Stomping from above
    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      enemy.destroy();
      player.setVelocityY(-300);
      this.score += 200;
      this.updateUI();
      this.showFloatText(enemy.x, enemy.y, '+200', '#2ecc71');
      this.cameras.main.shake(80, 0.005);
      return;
    }

    if (this.hasStar) {
      enemy.destroy();
      this.score += 200;
      this.updateUI();
      return;
    }

    // Take damage
    if (this.bigMode) {
      this.bigMode = false;
      this.player.setScale(1);
      this.invincible = true;
      this.time.delayedCall(2000, () => { this.invincible = false; });
      this.tweens.add({ targets: this.player, alpha: 0, yoyo: true, repeat: 8, duration: 120 });
    } else {
      this.playerDie();
    }
  }

  playerDie() {
    if (this.invincible) return;
    this.invincible = true;
    this.lives--;
    this.updateUI();
    this.player.setVelocityY(-400);
    this.player.body.allowGravity = true;
    this.physics.world.gravity.y = GRAVITY;
    this.cameras.main.shake(200, 0.015);
    this.time.delayedCall(1500, () => {
      if (this.lives <= 0) {
        this.scene.start('GameOver', { score: this.score });
      } else {
        this.scene.restart();
      }
    });
  }

  hitQBlock(block) {
    if (block.getData('used')) return;
    block.setData('used', true);
    block.setTexture('usedblock');
    block.refreshBody();

    const item = block.getData('item');
    this.tweens.add({ targets: block, y: block.y - 8, yoyo: true, duration: 80 });

    if (item === 'coin') {
      this.score += 100;
      this.coinCount++;
      this.updateUI();
      this.showFloatText(block.x, block.y - 32, '+100', '#f1c40f');
    } else {
      const pu = this.powerups.create(block.x, block.y - 40, item === 'star' ? 'star' : 'mushroom');
      pu.setData('type', item);
      if (item === 'mushroom') pu.setVelocityX(100);
      else { pu.body.allowGravity = false; }
    }
  }

  reachFlag() {
    this.physics.pause();
    this.score += 3000;
    this.updateUI();
    this.showFloatText(this.player.x, this.player.y - 40, 'GOAL! +3000', '#2ecc71');
    this.cameras.main.flash(500, 255, 255, 200);
    this.time.delayedCall(2500, () => {
      this.scene.start('Win', { score: this.score, coins: this.coinCount });
    });
  }

  showFloatText(x, y, msg, color = '#fff') {
    const t = this.add.text(x, y, msg, {
      fontFamily: 'monospace', fontSize: '14px', color,
      stroke: '#000', strokeThickness: 3,
    }).setDepth(30);
    this.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  updateUI() {
    this.scoreText.setText('SCORE: ' + this.score);
    this.livesText.setText('♥ x' + this.lives);
    this.coinText.setText('🪙 x' + this.coinCount);
  }

  update(time, delta) {
    if (this.invincible && this.lives <= 0) return;

    const p = this.player;
    const onGround = p.body.blocked.down;

    // Horizontal movement
    if (this.cursors.left.isDown) {
      p.setVelocityX(-PLAYER_SPEED);
      p.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      p.setVelocityX(PLAYER_SPEED);
      p.setFlipX(false);
    } else {
      p.setVelocityX(0);
    }

    // Jump
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
                        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
                        Phaser.Input.Keyboard.JustDown(this.cursors.up);

    if (jumpPressed) {
      if (onGround) {
        p.setVelocityY(JUMP_VEL);
        this.canDoubleJump = true;
      } else if (this.canDoubleJump) {
        p.setVelocityY(JUMP_VEL * 0.8);
        this.canDoubleJump = false;
      }
    }

    // Animations
    if (!onGround) {
      p.play('player_jump', true);
    } else if (Math.abs(p.body.velocity.x) > 10) {
      p.play('player_run', true);
    } else {
      p.play('player_idle', true);
    }

    // Enemy AI
    this.enemies.getChildren().forEach(e => {
      if (e.getData('type') === 'bat') {
        const t = e.getData('t') + delta * 0.002;
        e.setData('t', t);
        e.y = e.getData('startY') + Math.sin(t) * 60;
        e.setVelocityX(Math.sin(t * 0.5) * 80);
      } else {
        // Slime: reverse on edges/walls
        if (e.body.blocked.left) e.setVelocityX(60);
        if (e.body.blocked.right) e.setVelocityX(-60);
        if (!e.body.blocked.down && !e.body.blocked.left && !e.body.blocked.right) {
          e.setVelocityX(-e.body.velocity.x);
        }
      }
    });

    // Star flicker
    if (this.hasStar) {
      this.player.setTint(
        Phaser.Math.RND.pick([0xffff00, 0xff0000, 0x00ff00, 0x0000ff, 0xff69b4])
      );
    } else if (!this.invincible) {
      this.player.clearTint();
    }

    // Background parallax
    this.bg.tilePositionX = this.cameras.main.scrollX * 0.2;

    // Fall death
    if (p.y > this.deathY) {
      this.playerDie();
    }
  }
}

// ── Scene: GameOver ───────────────────────────────────────────────────────────

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }
  create(data) {
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
    this.add.text(W / 2, H / 2 - 80, 'GAME OVER', {
      fontFamily: 'monospace', fontSize: '36px', color: '#e74c3c',
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2, `SCORE: ${data.score}`, {
      fontFamily: 'monospace', fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 70, 'Press SPACE to retry', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff69b4',
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-Z', () => this.scene.start('Game'));
  }
}

// ── Scene: Win ────────────────────────────────────────────────────────────────

class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }
  create(data) {
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5);
    this.add.text(W / 2, H / 2 - 100, 'GOAL!!', {
      fontFamily: 'monospace', fontSize: '48px', color: '#f1c40f',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 - 20, `SCORE: ${data.score}`, {
      fontFamily: 'monospace', fontSize: '22px', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 30, `COINS: ${data.coins}`, {
      fontFamily: 'monospace', fontSize: '18px', color: '#f1c40f',
    }).setOrigin(0.5);
    this.add.text(W / 2, H / 2 + 90, 'Press SPACE to play again!', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff69b4',
    }).setOrigin(0.5);

    // Confetti
    const colors = [0xff69b4, 0xf1c40f, 0x2ecc71, 0x3498db, 0xe74c3c];
    for (let i = 0; i < 60; i++) {
      const r = this.add.rectangle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(-50, 0),
        8, 8, Phaser.Math.RND.pick(colors)
      );
      this.tweens.add({
        targets: r, y: H + 50,
        x: r.x + Phaser.Math.Between(-80, 80),
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 1000),
        repeat: -1,
        onRepeat: () => { r.x = Phaser.Math.Between(0, W); r.y = -50; },
      });
    }

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-Z', () => this.scene.start('Game'));
  }
}

// ── Phaser config ─────────────────────────────────────────────────────────────

const config = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('game'),
  width: W,
  height: H,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, GameOverScene, WinScene],
};

new Phaser.Game(config);
