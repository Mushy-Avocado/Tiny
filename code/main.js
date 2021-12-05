(function () {
  
  // a big chunk of this code was written nearly a year ago.
  // there are quite a few things I do different now

  new p5();

  Function.prototype.repeat = function (num, ...args) {
    for (let i = 0; i < num; i++) {
      this(...args)
    }
  }

  Array.prototype.random = function () {
    return this[floor(random() * this.length)]; 
  }

  let scene = 'menu'

  const mouse = {
    x: 0,
    y: 0,
  }

  const shake = {
    mag: 0,
    x: 0,
    y: 0,
    rand: 50,
    decay: 1.03,
    decayConst: 1.03,
    update: function () {
      if (this.mag > 0) {
        let rot = atan2(this.y, this.x)
        let newRot = rot * -1 + random(-this.rand, this.rand)
        this.x = cos(newRot) * this.mag
        this.y = sin(newRot) * this.mag
        this.mag *= 1 / (this.decay * delta())
        if (this.mag < 0.1) {
          this.mag = 0
          this.decay = this.decayConst 
        }
        translate(this.x, this.y)
      }
    },
    'new': function (mag, decay) {
      if (decay) this.decay = decay
      this.mag = mag ?? 100
    }
  } 

  const images = {
    'bee1': 'bee1.png',
    'bee2': 'bee2.png',
    'mite1': 'mite1.png',
    'mite2': 'mite2.png',
    'spider1': 'spider1.png',
    'grass1': 'grass1.png',
    'grass2': 'grass2.png',
    'grass3': 'grass3.png',
    'grasshopper1': 'grasshopper1.png',
    'flea': 'flea.png',
    'weaponButton': 'weaponButton.png',
    'weaponButtonNotif': 'weaponButtonNotif.png',
    'stick': 'stick.png',
    'club': 'club.png',
    'sword': 'sword.png',
    'person1': 'person1.png',
    'person2': 'person2.png',
    'personStand': 'personStand.png',
    'mainMenu': 'mainMenu2.png',
    'play': 'playButton.png',
    'boss1': 'boss1.png',
    'endScene': 'endSceneNew.png',
    'foot': 'foot.png',
    'ant1': 'ant1.png',
    'axe': 'axe.png',
  }
  const sounds = {
    'swingHit': 'swingHit.wav',
    'fly1': 'fly1.wav',
    'fly2': 'fly2.wav',
    'fly3': 'fly3.wav',
    'punch': 'punch.wav',
    'grunt': 'grunt.wav',
    'die': 'die.wav',
    'killBug': 'killBug.wav',
    'weaponSwing': 'weaponSwing.mp3',
    'monster1': 'monster1.wav',
    'squish': 'squish.wav',
    'dramatic': 'dramatic.wav',
  }

  const WIDTH = 1600;
  const HEIGHT = 1200;
  window.WIDTH = WIDTH
  window.HEIGHT = HEIGHT
  const ASPECT_RATIO = WIDTH / HEIGHT;
  const ORIGIN = HEIGHT - 100;
  const DEBUG = false;
  const GRAVITY = 0.4;
  const GROUND_PADDING = 30
  const KEYS = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39, 
  }
  const delta = () => constrain(deltaTime, 13, 100) / 13
  const increment = (num, increment) => {
    num /= increment
    num = round(num)
    num *= increment
  }

  document.oncontextmenu = e => {
    e.preventDefault()
  }

          
  // Mouse clicking
  let mouseWasClicked = false;

  // Keycodes
  const keys = [];

  const blocks = [];

  // Object constructors
  var maps, player;

  var blockSize = 40;

  // Camera
  var cam = {
      x: 0,
      y: 0,
  };

  const weaponsMenu = {
    x: WIDTH - 300,
    y: 50,
    w: 250,
    open: false,
    viewing: 0,
    draw: function () {
      if (this.open) {

        // Box
        fill(209, 211, 212)
        noStroke()
        rect(200, 200, WIDTH - 400, HEIGHT - 400)

        // Viewing
        this.viewing = constrain(this.viewing, 0, player.weapons.length - 1)
        let v = player.weapons[this.viewing]

        // Preview
        push()
          imageMode(CENTER)
          translate(WIDTH / 2, HEIGHT / 2 - 150)
          rotate(-45)
          let img = images[v.img]
          image(img, 0, 0, 400, img.height / img.width * 400)
        pop()

        // Arrows
        let x = WIDTH / 2 + 400
        let y = HEIGHT / 2
        let w = 50
        let h = 100
        let hover = Collisions.pointInsideRect(mouse.x, mouse.y, {
          x, y, w, h
        })

        // Right arrow
        fill(100)
        noStroke()
        if (hover || this.viewing >= player.weapons.length - 1) {
          fill(50)
        }
        if (hover && mouseWasClicked) {
          this.viewing++
        }
        
        triangle(x, y, x, y + h, x + w, y + h / 2)

        // Left arrow
        x = WIDTH / 2 - 400
        hover =  Collisions.pointInsideRect(mouse.x, mouse.y, {
          x: x - w, y, w, h
        })
        fill(100)
        if (hover || this.viewing <= 0) {
          fill(50)
        }
        if (hover && mouseWasClicked) {
          this.viewing--
        }
        triangle(x, y, x, y + h, x - w, y + h / 2)

        // Text
        fill(0)
        textAlign(CENTER, TOP)
        noStroke()
        textSize(30)

        text(`${v.name}\n\nDamage: ${v.damage}\nRange: ${v.length}\nSwing rate: ${v.rate}\nXP required: ${v.xp}`, WIDTH / 2, HEIGHT / 2 + 50)

        // Equip
        fill(100)
        noStroke()
        x = WIDTH / 2 - 50
        y = HEIGHT / 2 + 300
        w = 100
        h = 50
        hover = Collisions.pointInsideRect(mouse.x, mouse.y, { x, y, w, h })

        let e = v == player.equipped
        let u = player.xp >= v.xp
        if (u) v.viewed = true
        if (hover || e || !u) {
          fill(50)
        }

        rect(x, y, w, h, 5)

        fill(0)
        textSize(20)
        noStroke()
        textAlign(CENTER, CENTER)

        text((e ? 'Equipped!' : (u ? 'Equip' : 'Locked')), x + w / 2, y + h / 2)

        if (hover && mouseWasClicked && u) {
          player.equipWeapon(this.viewing)
        }

      }
    },
    button: function () {
      this.notif = false
      player.weapons.forEach(w => {
        if (player.xp >= w.xp && !w.viewed) {
          this.notif = true
        }
      })
      let hovering = Collisions.pointInsideRect(mouse.x, mouse.y, this)
      push()
        let img = images['weaponButton' + (this.notif ? 'Notif' : '')] 
        this.h = img.height / img.width * this.w
        translate(this.x - this.w / 2 + this.w, this.y - this.h / 2 + this.h)
        if (hovering) {
          scale(1.1)
          if (mouseWasClicked) {
            this.open = !this.open
          }
        }
        imageMode(CENTER)
        image(img, 0, 0, this.w, this.h)
      pop()
      if (DEBUG) {
        noFill()
        strokeWeight(1)
        stroke(0)
        rect(this.x, this.y, this.w, this.h)
      }
    },
  }

  // Terrain 
  // (lower = closer together 
  // higher = farther apart)
  const TERRAIN_DETAIL = 20;
  let grassBackground
  var mapNum = 0

  // Key pushed
  let terrainNoiseGenerator = 0
  window.keyPressed = function () {
    keys[keyCode] = keys[key.toString().toLowerCase()] = true;  
    if (DEBUG && keyCode === 192) {

      // Generate terrain for map
      let str = ''
      while (str.length < 100) {
        terrainNoiseGenerator += 1
        // Range must always be positive
        let r = ~~map(noise(terrainNoiseGenerator * 0.05), 0, 1, 0, 20)
        str += (random(1) < 0.5 ? '-' : '-') + r + ' ' 
      }
      console.log(str)
    }
    if (!audioStarted) {
      audioStarted = true
      userStartAudio()
    }
  };

  // Key released
  window.keyReleased = function () {
      keys[keyCode] = keys[key.toString().toLowerCase()] = false;  
  };

  // Find cell number
  function findCell (num) {
      return round(num / blockSize);
  }

  // Place something if not touching anything
  function placeNotTouching (x, y, w, h) {
      
      if(maps[mapNum].blocks[findCell(y)][findCell(x)] !== ' ') {
          return false;   
      }
      
      if(Collisions.rectInsideRect(player, {x, y, w, h})) {
          return false;
      }
          
      return true;
      
  }

  // Collision library 
  var Collisions = (function () {
      
      // Checks if a rect is touching a rect
      function rectInsideRect (r1, r2) {
          var leftSide = r1.x + r1.w > r2.x;
          var rightSide = r1.x < r2.x + r2.w;
          var topSide = r1.y + r1.h > r2.y;
          var bottomSide = r1.y < r2.y + r2.h;
          return leftSide && rightSide && topSide && bottomSide;
      }
      
      // Checks if a point is touching a rect
      function pointInsideRect (x, y, r1) {
          var leftSide = x >= r1.x;
          var rightSide = x <= r1.x + r1.w;
          var topSide = y >= r1.y;
          var bottomSide = y <= r1.y + r1.h;
          return leftSide && rightSide && topSide && bottomSide;
      }
      
      // Checks if a circle is touching a circle
      function circleInsideCircle (c1, c2) {
          return dist(c1.x, c1.y, c2.x, c2.y) <= c1.r + c2.r;
      }
      
      // Checks if a point is touching a circle
      function pointInsideCircle (x, y, c1) {
          return dist(c1.x, c1.y, x, y) <= c1.r;
      }
      
      return {
          'rectInsideRect': rectInsideRect,
          'pointInsideRect': pointInsideRect,
          'circleInsideCircle': circleInsideCircle,
          'pointInsideCircle': pointInsideCircle,
      };
      
  })();

  // Ground constructor
  const Ground = function (x, y, fillCol, strokeCol) {
      
      this.x = x;
      this.y = y;
      
      this.collide = function (that) {
          return Collisions.rectInsideRect(that, {x: this.x, y : this.y, w: TERRAIN_DETAIL, h : 50});
      };
      
  }

  // Particle constructor
  const particles = []
  particles.display = function () {
    stroke(this.fill)
    strokeWeight(3)
    line(this.x, this.y, this.x + cos(this.rot) * this.size, this.y + sin(this.rot) * this.size)
  }
  particles.add = function (config) {
    config.display = config.display ?? particles.display
    this.push(new Particle(config))
  }
  particles.draw = function () {
    for (let i = 0; i < this.length; i++) {
      let p = this[i]
      p.update()
      p.display()
      if (p.dead) {
        this.splice(i, 1)
      }
    }
  }
  const Particle = function (config) {
    config = Object.create(config) // remove any binding to config
    this.x = config.x ?? 0
    this.y = config.y ?? 0
    this.rot = config.rot ?? random(0, 360)
    this.speed = config.speed ?? random(2, 10)
    this.size = config.size ?? random(2, 10)
    this.fill = config.fill ?? color(0)
    setTimeout(() => {
      this.dead = true
    }, (config.life ?? 1000 + random(-500, 500)))
    if (config.display) {
      config.display = config.display.bind(this)
    }
    this.display = config.display ?? function () {
      fill(this.fill)
      noStroke()
      rect(this.x, this.y, this.size, this.size)
    }
    this.update = function () {
      this.x += cos(this.rot) * this.speed
      this.y += sin(this.rot) * this.speed
      this.speed /= 1.01
    }
  }

  // Create terrain
  function generateTerrain (map1) {

      var h = 0;

      if (!map1.grass) {
        map1.grass = {
          front: [],
          back: [],
        }
      }
      
      for(var i = 0; i < map1.ground.length; i++) {
          
          // Variables
          var m = map1.ground[i];
          
          if(m[0] === '-' || m[0] === '+') {
              h += parseInt(m, 10);    
          }
          
          else {
              h = parseInt(m, 10);   
          }
          
          map1.grounds.push(new Ground(i * TERRAIN_DETAIL, HEIGHT - h));

          if (random() < (map1.grassDensity ?? 0.5)) {
            let inFront = random() < 0.3 ? 'front' : 'back'
            let g = Object.create(map1.grounds[i])
            g.grassImg = ([
              'grass1',
              'grass2',
              'grass3',
            ]).random()
            map1.grass[inFront].push(g)
          }
          
      }
          
  }

  // Create block cells
  function createBlocks () {
      
      for(var i = 0; i < maps.length; i++) {
          
          var str = '';
          var cellsW = findCell(maps[i].ground.length * TERRAIN_DETAIL);
          var cellsH = findCell(HEIGHT);
          for(var j = 0; j < cellsW; j++) {
              str += ' ';   
          }
          
          for(var j = 0; j < cellsH; j++) {
              maps[i].blocks.push(str);   
          }
          
      }   
            
  }

  // Pond constructor
  const Pond = function (x, y, w) {
      
      this.x = x;
      this.y = y + ORIGIN;
      
      this.w = w;
      
      this.display = function () {
          
          fill(109, 128, 191, 150);
          stroke(145, 177, 196);
          strokeWeight(4);
          
          rect(this.x, this.y, this.w, 1000);
            
      };
      
      this.collide = function(that) {
          return that.x > this.x && that.x - that.w < this.x + this.w && that.y + that.h / 2 > this.y;
      };
          
  }

  // Circle constructor
  const Circle = function (x, y, r, col, stroke1, strokeWeight1) {
    
      this.x = x;
      this.y = y;
      
      this.r = r;
      this.d = this.r * 2;
      
      this.fill = col;
      this.stroke = stroke1;
      this.strokeWeight = strokeWeight1; 
      
      this.display = function () {
        
          fill(this.fill);
          stroke(this.stroke);
          strokeWeight(this.strokeWeight);
          
          ellipse(this.x, this.y, this.d, this.d);

          if (DEBUG) {
            noFill();
            stroke(0);
            strokeWeight(3);
            ellipse(this.x, this.y, this.d, this.d);
          }
          
      };
      
      this.isTouching = function(x, y) {
          return dist(x, y, this.x, this.y) < this.r;
      };
      
      this.collide = function (that) {
        
        let closest_x = constrain(this.x, that.x, that.x + that.w)
        let closest_y = constrain(this.y, that.y, that.y + that.h)
        if (dist(closest_x, closest_y, this.x, this.y) < this.r) {
          let dX = that.x - closest_x
          let dY = that.y - closest_y
          let rot = atan2(closest_y - this.y, closest_x - this.x)
          let nX = this.x + cos(rot) * this.r
          let nY = this.y + sin(rot) * this.r
          that.x = nX + dX
          that.y = nY + dY
          if (that.y + that.h < this.y) {
            that.velY = 0
            that.jump = true
          }
        }

      };
      
          
  }

  // Enemy constructor 
  function Enemy (config) {

    this.x = config.x ?? 0
    this.y = config.y ?? 0
    this.velX = 0
    this.velY = 0
    this.accX = 0
    this.accY = 0
    this.friction = config.friction ?? 0.7
    this.w = config.w ?? 50
    this.h = config.h ?? 50
    this.sight = config.sight ?? 600
    this.jump = false
    this.jumpHeight = 8
    this.speed = config.speed ?? 4.5
    this.inSight = false
    this.hit = false
    this.hp = config.hp ?? 50
    this.damage = config.damage ?? 10
    this.accSpeed = 0.1
    this.xp = config.xp ?? 50

    this.dirX = 1
    this.dirY = 0

    if (config.display) {
      config.display.bind(this)
    }

    this.display = config.display ?? function () {
      if (this.img) {
        push()
          translate(this.x + this.w / 2, this.y + this.h / 2)
          scale(-this.dirX, 1)
          imageMode(CENTER)
          image(this.img, 0, 0, this.w, this.img.height / this.img.width * this.w)
        pop()
      } else {
        push()
          translate(this.x + this.w / 2, this.y + this.h / 2)
          scale(this.dirX, 1)
          fill(255, 0, 0)
          noStroke()
          rect(-this.w / 2, -this.h / 2, this.w, this.h)
        pop()
      }
    }

    if (config.update) {
      config.update.bind(this)
    }

    this.update = config.update ?? function () {

      // Check vision
      this.inSight = abs(this.x + this.w / 2 - (player.x + player.w / 2)) < this.sight
      if (this.checkVision) {
        this.checkVision()
      }

      // Previous position
      this.prevX = this.x;
      this.prevY = this.y;
      
      if (this.inSight && (this.airControl !== false || this.jump)) {
        // Move left
        if (player.x + player.w / 2 < this.x + this.w / 2) {
            this.accX = -this.accSpeed;
            this.dirX = -1;
        } else {
            this.accX = this.accSpeed;
            this.dirX = 1;
        }
      } else if (!this.hit) {
        this.velX *= this.friction
      }
      
      // Limit speed swimming
      if(this.movement === 'swimming') {
        this.velX = constrain(this.velX, -3, 3);
      } else if (!this.hit) {
        this.velX = constrain(this.velX, -this.speed, this.speed)
      }
      
      // Move
      this.velX += this.accX * delta()
      this.x += this.velX * delta()
      this.x = constrain(this.x, 0, maps[mapNum].ground.length * TERRAIN_DETAIL - this.w - 25);
      this.accX = 0
      
      // Collsions x with ground
      for(var i = 0; i < maps[mapNum].ground.length; i++) {
          var g = maps[mapNum].grounds[i];
          if(g.collide(this) && this.y + this.h > g.y + GROUND_PADDING) {
              this.x = this.prevX < g.x ? g.x - this.w: g.x + TERRAIN_DETAIL;
          }  
      }
      
      // Collisions x with blocks
      for(var i = 0; i < blocks.length; i++) {
          var g = blocks[i];
          if(g.collide(this)) {
              this.x = this.prevX < g.x ? g.x - this.w: g.x + blockSize;
          }  
      }
      
      // Gravity
      this.velY += GRAVITY * delta();
      
      // Jump
      if(this.movement === 'swimming') {
          this.velY = -1;   
      }
      else if(this.jump && this.inSight && player.y < this.y + this.h - 200) {
        this.velY = -this.jumpHeight;
        this.dirY = -1
      }
      
      // Move y
      this.y += this.velY * delta();
      this.jump = false;

      if (this.velY > 4) {
        this.dirY = 1
      } else if (this.velY > 0) {
        this.dirY = 0
      }
      
      // Collisions y
      for(var i = 0; i < maps[mapNum].grounds.length; i++) {
          var g = maps[mapNum].grounds[i];
          if(g.collide(this)) {
              this.y = g.y - this.h;
              this.velY = 0;
              this.jump = true;
          }  
      }
      
      // Collisions y with blocks
      for(var i = 0; i < blocks.length; i++) {
          var g = blocks[i];
          if(g.collide(this)) {
              this.y = this.prevY < g.y ? g.y - this.h: g.y + blockSize;
              this.velY = 0;
              if(this.prevY < g.y) {
                  this.jump = true;
              }
          }  
      }

      // Collision with player
      this.hitPlayer()

      if (this.jump && this.hit) {
        this.hit = false
      }

    }

    this.hitPlayer = function () {
      this.hitAgain -= delta()
      if (Collisions.rectInsideRect(this, player) && (this.hitAgain <= 0 || !this.hitAgain)) {
        player.hp -= this.damage
        let r = atan2(this.y + this.h / 2 - player.y + player.h / 2, this.x + this.w / 2 - player.x + player.w / 2)
        this.velX = cos(r + 180) * 5
        this.velY = sin(r + 180) * 5
        this.hitAgain = this.againTime ?? 40
        if (this.playSound !== false) {
          sounds.punch.play()
          sounds.grunt.play()
        } else {
          player.velY = -4
        }
        shake.mag = 15
      }
    }

  }

  function Flea (config) {
    Enemy.call(this, config)
    this.hp = 60
    this.h = 7
    this.w = 7
    this.damage = 2
    this.jumpHeight = 10
    this.speed = 5
    this.sight = 800
    this.img = images.flea
    this.xp = 10
    this.playSound = false
  }

  function Mite (config) {
    Enemy.call(this, config)
    this.img = images.mite1
    this.h = 30
    this.hp = 30
    this.damage = 5
    setInterval(() => {
      if (this.velX > 1) {
        this.img = (this.img === images.mite1 ? images.mite2 : images.mite1)
      }
    }, 100)
  }

  function Ant (config) {
    Enemy.call(this, config)
    this.img = images.ant1
    this.jumpHeight = 0
    this.w = 50
    this.h = 30
    this.hp = 70
    this.damage = 20
    this.speed = 6 + random(-1, 1)
    this.accSpeed = 0.15 + random(-0.01, 0.01)
    this.dX = this.x
    this.dY = this.y
    this.display = function () {
      this.dX = lerp(this.dX, this.x, 0.2 * delta())
      this.dY = lerp(this.dY, this.y, 0.2 * delta())
      push()
        translate(this.dX + this.w / 2 + (30 * this.dirX), this.dY + this.h / 2)
        scale(-this.dirX, 1)
        imageMode(CENTER)
        this.w = 150
        image(this.img, 0, 0, this.w, this.img.height / this.img.width * this.w)
        this.w = 50
      pop()
    }
  }

  function Grasshopper (config) {

    Enemy.call(this, config)

    this.jumpHeight = 15
    this.speed = 7
    this.accSpeed = 0.25
    this.hp = 170
    this.damage = 15
    this.sight = 600
    this.w = 200
    this.h = 70
    this.xp = 500
    this.img = images.grasshopper1

  }

  function JumpingSpider (config) {

    Enemy.call(this, config)

    this.jumpHeight = 10
    this.speed = 6.5
    this.accSpeed = 0.2
    this.hp = 90
    this.damage = 12
    this.sight = 300
    this.xp = 100
    this.img = images.spider1
    this.h = 40
    this.w = 150

  }

  function Boss (config) {

    Enemy.call(this, config)

    this.damage = 20
    this.speed = 6
    this.accSpeed = 0.1
    this.hp = 400
    this.sight = 80000
    this.xp = 1000
    this.jumpHeight = 20
    this.img = images.boss1
    this.w = 500
    this.h = 100
    this.boss = true

    this.onHit = function () {
      this.velX = 0
      this.speed += 0.05
      this.accSpeed += 0.01
      sounds.monster1.play()
    }

    this.hitPlayer = function () {
      this.hitAgain -= delta()
      if (Collisions.rectInsideRect(this, player) && (this.hitAgain <= 0 || !this.hitAgain)) {
        player.hp -= this.damage
        let r = atan2(this.y + this.h / 2 - player.y + player.h / 2, this.x + this.w / 2 - player.x + player.w / 2)
        player.velX = cos(r + 180) * 50
        player.velY = sin(r + 180) * 10
        this.hitAgain = this.againTime ?? 100
        sounds.punch.play()
        sounds.grunt.play()
        shake.mag = 40
      }
    }

  }

  function Bee (config) {

    Enemy.call(this, config)

    this.damage = 18
    this.hoverHeight = 500
    this.dropping = false
    this.altitudeSpeed = 2.5 + random(-0.1, 0.1)
    this.accSpeed = 0.15 + random(-0.05, 0.05)
    this.speed = 4 + random(-1, 1)
    this.sight = 700
    this.hp = 60
    this.xp = 200
    this.w = 80
    this.h = 80
    this.img = images.bee1

    this.display = function () {
      this.w += 10
      this.h += 10
      push()
        translate(this.x, this.y)
        rotate(this.velX * 2)
        imageMode(CENTER)
        if (this.img === images.bee1) {
          this.img = images.bee2
        } else {
          this.img = images.bee1
        }
        image(this.img, this.w / 2, this.h / 2, this.w + 10, this.img.height / this.img.width * this.w + 10)
      pop()
      this.w -= 10
      this.h -= 10
    }

    this.update = function () {

      // Check vision
      this.inSight = abs(this.x - player.x) < this.sight

      // Previous position
      this.prevX = this.x;
      this.prevY = this.y;
      
      if (this.inSight) {
        // Move left
        if (player.x + player.w / 2 < this.x + this.w / 2) {
            this.accX = -this.accSpeed;
            this.dirX = -1;
        } else {
            this.accX = this.accSpeed;
            this.dirX = 1;
        }
      } else if (!this.hit) {
        this.velX *= this.friction
      }
      
      // Limit speed
      this.velX = constrain(this.velX, -this.speed, this.speed)

      if (this.jump && this.hit) {
        this.hit = false
      }
      
      // Move
      this.velX += this.accX
      this.x += this.velX * delta();
      this.x = constrain(this.x, 0, maps[mapNum].ground.length * TERRAIN_DETAIL - this.w - 25);
      this.accX = 0
      
      // Collsions x with ground
      for(var i = 0; i < maps[mapNum].ground.length; i++) {
        var g = maps[mapNum].grounds[i];
        if(g.collide(this) && this.y + this.h > g.y + GROUND_PADDING) {
            this.x = this.prevX < g.x ? g.x - this.w: g.x + TERRAIN_DETAIL;
        }  
        if (this.x + this.w / 2 >= g.x && this.x + this.w / 2 <= g.x + TERRAIN_DETAIL && !this.dropping) {
          if (this.y > g.y - this.hoverHeight) {
            this.y -= this.altitudeSpeed * delta()
          } else if (this.y < g.y - this.hoverHeight - 50) {
            this.y += this.altitudeSpeed * delta()
          } else {
            // Check if in range for destruction
            if (abs(this.x - player.x) < 40 && !this.dropping) {
              this.dropping = true
              this.velY = -8
              sounds[['fly1', 'fly2', 'fly3'].random()].play()
            }
          }
        }
      }
      
      // Move y
      this.y += this.velY * delta();
      if (this.dropping) {
        this.velY += 0.5 * delta()
      } else {
        this.velY = 0
      }
      if (this.jump) {
        this.dropping = false
      }

      this.jump = false

      if (this.velY > 4) {
        this.dirY = 1
      } else if (this.velY > 0) {
        this.dirY = 0
      }
      
      // Collisions y
      for(var i = 0; i < maps[mapNum].grounds.length; i++) {
          var g = maps[mapNum].grounds[i];
          if(g.collide(this)) {
              this.y = g.y - this.h;
              this.velY = 0;
              this.jump = true;
          }  
      }

      this.hitPlayer()

    }

    this.onHit = function () {
      this.speed += 0.5
      this.sight += 50
      this.altitudeSpeed += 0.5
      this.accSpeed += 0.02
    }

  }

  // Player constructor
  function Player (x, y) {

      this.x = x;
      this.y = y;
      this.velY = 0;
      this.velX = 0;
      this.dirX = 0;
      this.dirY = 0;
      this.w = 60;
      this.h = 130;
      this.speed = 7.5
      this.jumpHeight = 10
      this.jump = false;
      this.displayX = this.x;
      this.displayY = this.y;
      this.movement = 'walk';
      this.rot = 0;
      this.rotDisp = 0;
      this.holdingBreath = false;
      this.o2 = 100;
      this.holding = 'block';
      this.hp = 100;
      this.hpD = 50;
      this.dirX = 1
      this.xp = 0
      this.xpDisplay = 0
      this.img = 'person1'
      this.equipWeapon = function (num) {
        let w = this.weapons[num]
        this.weapon.length = w.length * this.weapon.scale
        this.weapon.rate = w.rate
        this.weapon.damage = w.damage
        this.equipped = w
      }
      this.weapons = [
        {
          name: 'Stick',
          img: 'stick',
          xp: 0,
          length: 175,
          damage: 10,
          rate: 30, 
          viewed: true,
        },
        {
          name: 'Club',
          img: 'club',
          xp: 500,
          length: 165,
          damage: 20,
          rate: 50, 
          viewed: false,
        },
        {
          name: 'Sword',
          img: 'sword',
          xp: 3000,
          length: 205,
          damage: 15,
          rate: 20, 
          viewed: false,
        },
        {
          name: 'Battle Axe',
          img: 'axe',
          xp: 5000,
          length: 210,
          damage: 30,
          rate: 35,
        },
      ]
      this.weapon = {
        swinging: false,
        num: 0,
        goBack: false,
        target: 60,
        rot: 0,
        again: 0,
        displayRot: 0,
        dirX: 1,
        scale: 0.7,
        update: (function () {
          let mdY = mouse.y + cam.actualY - player.y
          this.weapon.again -= delta()
          if (this.weapon.again < 0) {
            this.weapon.rot = -30
          }
          if (mouseIsPressed && !weaponsMenu.open && !this.weapon.swinging && this.weapon.again < 0) {
            this.weapon.swinging = true
            this.weapon.rot = -100
            this.weapon.dirX = this.dirX
            setTimeout(() => {
              sounds.weaponSwing.play()
            }, 50)
          }
          if (this.weapon.swinging) {
            this.weapon.x = this.x + this.w / 2 +  (20 * this.weapon.dirX) + cos(this.weapon.rot) * (this.weapon.length * this.weapon.dirX)
            this.weapon.y = this.y + this.h / 2 + sin(this.weapon.rot) * (this.weapon.length)
            this.weapon.again = this.weapon.rate
            if (!this.weapon.goBack) {
              this.weapon.rot += 8 * delta()
              if (this.weapon.rot > 90) {
                this.weapon.swinging = false
                this.weapon.goBack = false
              }
            }
          }
        }).bind(this),
        display: (function () {
          this.weapon.displayRot = lerp(this.weapon.displayRot, this.weapon.rot, constrain(0.3 * delta(), 0.3, 0.9))
          //if (this.weapon.again > 0) {
          if (true) {
            rotate(-45)
            let img = images[this.equipped.img]
            let w = this.weapon.length * this.weapon.scale
            let h = img.height / img.width * w
            imageMode(CORNER)
            image(img, 0, -h / 2, w, h)
          }
        }).bind(this),
      };
      this.equip = 0
      this.equipWeapon(this.equip)

      setInterval((function () {
        if (keys['a'] || keys['d']) {
          this.img = this.img === 'person1' ? 'person2' : 'person1'
        }   
      }).bind(this), 100)

      setInterval(() => {
        if (this.o2 <= 0) {
          this.hp -= 20
          sounds.grunt.play()
        } else {
          this.hp += 10
        }
        if (DEBUG) {
          this.hp = 100
        }
      }, 3000)
      
      this.display = function () {
          
          // Smooths out the movement (removed)
          this.displayX = this.prevX + this.moveX * 2
          this.displayY = this.prevY + this.velY * 2
          this.rotDisp = lerp(this.rotDisp, this.rot, constrain(0.1 * delta(), 0.01, 0.9));
          
          this.rot = (this.holdingBreath ? 90 : 0);
          
          push();
              
              translate(this.displayX + this.w / 2, this.displayY + this.h / 2);
              
              push()
                scale(this.dirX, 1)
                translate(22, constrain(this.weapon.displayRot, 5, 10))
                rotate(this.weapon.displayRot)
                this.weapon.display()
              pop()

              push()
                rotate(this.rotDisp);
                scale(this.dirX, 1)

                imageMode(CENTER)
                let img = images[this.img]
                image(img, 0, 0, this.w + 30, img.height / img.width * (this.w + 30))
              pop()
            
          pop();

          if (DEBUG) {
            stroke(0)
            noFill()
            strokeWeight(1)
            rect(this.x, this.y, this.w, this.h)
          }


          if (DEBUG) {
            noStroke()
            fill(0)
            textAlign(RIGHT, BOTTOM)
            textSize(25)
            text(`x: ${~~this.x} y: ${~~this.y}`, this.x - 30, this.y - 30)
          }

          if (DEBUG) {
            stroke(0)
            strokeWeight(1)
            line(this.x + this.w / 2, this.y + this.h / 2, this.weapon.x, this.weapon.y)
          }
            
      };
      
      this.update = function () {
          
          // Previous position
          this.prevX = this.x;
          this.prevY = this.y;

          this.moveX = 0

          // Move left
          if (keys['a']) {
              let s = -this.speed;
              this.x += s * delta();
              this.moveX += s
              this.dirX = -1;
          }
          
          // Move right
          if (keys['d']) {
              let s = this.speed;
              this.x += s * delta();
              this.moveX += s
              this.dirX = 1;
          }

          this.velX *= 1 / constrain(1.01 * delta(), 1.01, 2)

          if (!keys['a'] && !keys['d']) {
            this.img = 'personStand'
          }
          
          // Limit speed swimming
          if(this.movement === 'swimming') {
              this.velX = constrain(this.velX, -3, 3);
              this.velY = constrain(this.velY, -0.5, 0.5);
          }
          
          // Move
          this.x += this.velX * delta();
          this.x = constrain(this.x, 0, maps[mapNum].ground.length * TERRAIN_DETAIL - this.w - 25);
          
          // Collsions x with ground
          for(var i = 0; i < maps[mapNum].ground.length; i++) {
              var g = maps[mapNum].grounds[i];
              if(g.collide(this) && this.y + this.h > g.y + GROUND_PADDING) {
                  this.x = this.prevX < g.x ? g.x - this.w: g.x + TERRAIN_DETAIL;
              }  
          }
          
          // Collisions x with blocks
          for(var i = 0; i < blocks.length; i++) {
              var g = blocks[i];
              if(g.collide(this)) {
                  this.x = this.prevX < g.x ? g.x - this.w: g.x + blockSize;
              }  
          }
          
          // Gravity
          this.velY += GRAVITY * delta();
          
          // Jump
          if(this.movement === 'swimming' && keys[' ']) {
              this.velY = -1;   
          }
          else if(this.jump && keys[' ']) {
            this.velY = -this.jumpHeight;
            this.dirY = -1
          }
          
          // Move y
          this.y += this.velY * delta();
          this.jump = false;

          if (this.velY > 4) {
            this.dirY = 1
          } else if (this.velY > 0) {
            this.dirY = 0
          }
          
          // Collisions y
          for(var i = 0; i < maps[mapNum].grounds.length; i++) {
              var g = maps[mapNum].grounds[i];
              if(g.collide(this)) {
                  this.y = g.y - this.h;
                  this.velY = 0;
                  this.jump = true;
              }  
          }
          
          // Collisions y with blocks
          for(var i = 0; i < blocks.length; i++) {
              var g = blocks[i];
              if(g.collide(this)) {
                  this.y = this.prevY < g.y ? g.y - this.h: g.y + blockSize;
                  this.velY = 0;
                  if(this.prevY < g.y) {
                      this.jump = true;
                  }
              }  
          }

          // Check enemy hit
          if (!this.weapon.swinging) {
            this.hit = false
          }
          if (this.weapon.swinging && !this.hit) {
            for (let i = 0; i < maps[mapNum].enemies.length; i++) {
              let e = maps[mapNum].enemies[i]
              if (collideLineRect(this.x + this.w / 2 + (20 * this.weapon.dirX), this.y + this.h / 2, this.weapon.x, this.weapon.y, e.x, e.y, e.w, e.h)) {
                shake.mag = 10
                let r = atan2(e.y - player.y + player.h / 2, e.x - player.x + player.w / 2)
                e.velX += cos(r) * 10
                e.velY += sin(r) * 10
                e.hit = true
                e.hp -= this.weapon.damage
                if (e.onHit) e.onHit()
                sounds.swingHit.setVolume(2)
                sounds.swingHit.play()
                if (e.hp <= 0) {
                  sounds.killBug.play()
                  player.xp += e.xp
                }
                for (let i = 0; i < 8; i++) {
                  particles.add({
                    x: this.x + this.w / 2 +  (20 * this.weapon.dirX) + cos(r) * 40,
                    y: this.y + this.h / 2 + sin(r) * 40,
                    size: random(5, 20),
                    rot: r + random(-17, 17),
                    speed: random(10, 15),
                    life: 300 + random(-100, 100),
                    fill: ([
                      color(255, 229, 112),
                      color(184, 170, 108),
                      color(224, 192, 157)
                    ]).random(),
                  })
                }
                this.hit = true
              }
            }
          }
          
          // Lose o2
          if(this.holdingBreath) {
              this.o2 -= 0.3;   
          }
          
          else {
              this.o2 += 0.7;   
          }
          
          // Constrain o2
          this.o2 = constrain(this.o2, 0, 100);

          // Update weapon
          this.weapon.update()
            
      };
      
      this.placeBlock = function() {
          
          var x = findCell(mouse.x + cam.x - blockSize / 2);
          var y = findCell(mouse.y + cam.y - blockSize / 2);
          
          stroke(89, 62, 37, 50);
          noFill();
          strokeWeight(3);
          
          rect(x * blockSize, y * blockSize, blockSize, blockSize);
          
          if(mouseWasClicked && mouseButton === LEFT) {
              if(placeNotTouching(x * blockSize, y * blockSize, blockSize, blockSize) && y * blockSize > 0 && y * blockSize < HEIGHT) {
                  blocks.push(new Block(x, y, 'x'));  
              }
          }
            
      };
      
      this.drawBar = function (x, y, s, num, fill1, fill2, icon) {
          
          stroke(fill2);
          strokeCap(SQUARE);
          strokeWeight(s / 42 * 10);
          noFill();
          
          ellipse(x, y, s, s);
          
          stroke(fill1);
          strokeWeight(s / 42 * 4);
          arc(x, y, s, s, -90, -90 + (num / 100) * 360);
          
      };

      this.respawn = function () {
        this.x = maps[mapNum].spawnX
        this.y = maps[mapNum].spawnY
        this.hp = 100
      }
      
      this.drawBars = function () {
          
          // oxygen
          if(player.o2 < 96) {
              fill(54, 194, 161);
              noStroke();
              rect(100, HEIGHT - 40, player.o2 / 100 * (WIDTH - 200), 30, 5);
          }
          
          // hp
          fill(235, 70, 70)
          noStroke()
          rect(0, HEIGHT - 40, WIDTH, 40)
          fill(0, 255, 10)
          rect(0, HEIGHT - 40, WIDTH * (this.hpD / 100), 40)
          //this.drawBar(25, 25, 34, this.hpD, color(0, 255, 9), color(235, 70, 70));
          this.hp = constrain(this.hp, 0, 100)

          this.hpD = lerp(this.hpD, this.hp, 0.2 * delta());

          // xp
          if (this.xpDisplay < this.xp) {
            this.xpDisplay += 2
          } else if (this.xpDisplay > this.xp) {
            this.xpDisplay -= 2
          }

          fill(210, 211, 212)
          noStroke()
          textSize(40)
          textAlign(LEFT, BOTTOM)
          text('Total XP: ' + this.xpDisplay, 15, HEIGHT - 60)
            
      };
          
  }

  var maps = [

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 200,
          spawnY: -1000,
          ground:
              '131 +3 +3 +2 +2 -2 +2 +2 -2 +3 -3 +3 -3 +3 +3 +3 -2 -3 +3 -3 -3 +3 +4 -4 +4 -4 +4 +5 -5 -6 +6 +6 +6 -6 -6 -5 +5 +5 -5 +5 +5 +5 +5 +5 -5 -5 +5 -5 +5 +5 -5 +4 -4 +4 +4 -4 -4 -4 +4 +4 -10 -20 -40 -20 -30 -20 -30 -20 +2 -10 -3 +3 +3 -3 -2 -2 +2 -3 -3 +3 +3 +3 +4 +4 +3 -3 +3 +4 -4 -4 -3 -3 +3 +3 -4 -4 -4 +3 +3 -3 +3 -3 -3 -3 -4 +4 -3 +3 -3 +3 -3 -3 +3 -3 +3 +3 +3 +4 +4 -4 -4 +5 +5 -5 -5 +5 -5 -6 +6 +7 +7 -7 -7 -7 +7 -7 +7 +7 +7 +7 +7 +7 +7 +6 +6 -6 -5 -5 -4 +6 -3 -2 +3 +5 -3 +5 -3 -10 +10 -4 +7 -2 +4 +7 -7 +6 +6 -5 -5 +5 +4 -4 -3 +3 +4 -4 -3 -3 -3 -3 -3 -2 +2 -2 -3 +3 -3 +4 +4 +4 -5 +4 -4 +4 -4 +4 -4 +4 -4 -3 -3 -3 +3 -3 +3 +3 -4 -4 +4 +5 +5 -5 +6 +6 +6 +7 +7 -7 +7 +6 +6 -6 +6 +6 +6 +6 +5 -5 -5 -5 -5 -5 +5 +4 -4 -3 +3 -2 -2 -2 +2 +2 -3 -3 +3 -3 +2 +2 +3 -3 +3 -3 -3 -3 -4 -4 -4 +4 -5 -5 +5 +5 +5 -5 +5 -5 -6 +6 +6 +7 +7 -7 -7 +6 +5 +5 +4 -4 -3 -3 +3 -3 -3 -3 -3 +4 -4 -3 -3 -3 -3 -3 -3 +3 -3 -3 -3 -3 -3 +3 -4 -4 +4 +4 +3 +3 -3 +3 -3 -3 -3 -2 -2 +2 +2 +2 -2 +2 -2 +3 -3 -3 +3 -3 +3 +3 -3 +3 -3 -3 -3 -2 +2 -2 +2 -2 -2 +2 +2 -2 +1 +1 -1 +1 +1 +2 +2 +2 +2 -2 -2 -2 -2 +2 +2 +2 -2 -2 +2 -2 +2 +2 +3 -3 -3 -3 -3 -4 -4 +3 -3 -3 -3 +4 -4 +5 +5 +5 +5 +5 -5 +5 +6 -6 +6 -6 -6 +6 +6 -6 -6 +6 -6 -5 +5 -4 -5 -5 +5 +5 -5 -5 -5 +5 +5 -5 +5 +4 +4 -4 -4 +4 -4 -4 -4 +3 -3 -4 +4 -3 -3 +3 +4 +4 +4 +4 +4 +5 +5 -4 -4 +4 -4 -4 +4 +4 -4 -4 -4 +4 +4 -4 -4 +5 +5 +5 -6 -6 -6 -6 -6 -6 -6 -5 -5 +5 +5 +5 +5 +5 +5 +4 -4 +4 -4 +5 +5 +5 -5 +5 -5 -5 +5 -5 +6 -6 +6 -5 +5 -5 -5 +5 -5 +6 -6 +6 -6 -6 +6 +6 -6 -6 -6 -7 -6 -6 -6 -6 +5 -5 +5 +4 -4 +4 +4 -3 +3 -2 +1 -1 -1 -1 +1 +2 +2 +2 +2 -3 -4 -4 -4 +4 +4 -5 +5 +5 -5 +5 -5 +5 -5 -5 -6 +6 -6 -6 -6 +6 +6 +6 +6 +6 +6 -6 +6 -6 -6 -6 -6 +6 +7 +6 -6 -6 -6 +6 -6 -5 +5 -4 -4 -4 -4 -4 +5 -5 +5 +5 -5 -5 -5 -5 +5 +5 +5 -5 +5 +5 +5 -4 +4 +4 -4 +4 +4 -4 +4 -3 -3 +3 +3 -3 -3 +3 -3 +13 +14 -13 -13 -12 -12 +12 -12 +13 -13 -13 +12 -11 +11 +10 +11 +12 +12 +12 +12 -13 +14 +15 -15 +16 +15 -15 -14 +13 -13 -12 -11 +11 -12 +13 +13 -13 -13 +11 -11 -11 -11 +12 -13 -13 -14 +14 +13 +13 -13 +12 -12 +12 -12 +12 +12 -11 -10 -9 -8 +8 -8 -7 -7 +7 -8 +9 +11 +11 +12 -12 +12 -12 -13 -13 +13 +12 -11 +9 +9 +9 +9 -10 +11 -12 +12 +13 -14 -15 -16 +17 -17 +18 -19 -19 -19 -20 +20 +20 +20 +20 -20 -20 -21 -22 -22 +22 -22 -23 +24 -24 -23 +23 +23 -22 +21 +20 +18 -18 +17 +17 -17 -16 -16 -16 -15 -14 +14 -15 +15 +15 +16 +16 +17 -17 +17 -17 -17 +17 +18 -18 +18 -18 -17 -17 -17 -17 +17 -17 +17 +17 +17 -18 +18 -17 -16 +15 -14 +13 +13 +14 -14 +13 +12 +13 -13 -13 -13 -12 +12 +13 +12 +12 +12 +12 -13 +14 -15 -16 -16 +15 +15 +14 -13 -13 +12 +11 +11 +11 +11 -12 -12 -13 +14 +14 -15 +14 +13 -13 -13 -13 -14 +15 -16 +15 -15 -15 +15 -15 +15 -15 -15 -15 +16 +15 -15 -14 -12 +12 +13 +14 +14 +14 -15 -16 -17 -18 +20 +20 -20 +19 -19 +18 -17 +16 -15 -14 +14 -13 -13 +11 +10 +9 -8 +8 +8 +8 -8 -8 +8 +8 -8 -9 -10 -11 +12 +13 -13 -13 -14 +14 -15 +16 -16 +15 +15 +14 -13 -13 -13 -13 +13 -15 -17 -17 +18 -19 -20 +21 -21 +20 -20 +20 -19 +19 +20 +21 +21 +22 +21 -20 +19 +19 +19 -19 +19 -20 -20 -19 -18 -17 -16 +15 +14 -13 -12 -10 -9 -9 -9 +9 -9 +10 -10 -10 +9 +9 +9 -9 -9 +10 +11 -12 -13 -15 +17 +18 -19 +19 +19 +19 +18 +17 +16 -15 +15 +14 +14 +15 -14 -13 -13 -12 +11 -11 -12 -12 +12 +12 -12 +11 +11 +10 +10 +9 +9 +8 +7 -6 -6 +7 +7'
                .split(' '),
          ponds: [

          ],
          grounds: [

          ],
          circles: [
              new Circle(826, 1000, 60, color(170), color(150), 5),
              new Circle(900, 1000, 40, color(150), color(125), 5),
              new Circle(1560, 1250, 40, color(170), color(150), 5),
              new Circle(3010, 1200, 120, color(150), color(125), 5),
              new Circle(4500, 1200, 90, color(195), color(195), 5),
              new Circle(5900, 1250, 100, color(150), color(125), 5),
              new Circle(410, 1210, 70, color(150), color(125), 5),
          ],
          blocks: [

          ],
          text: [
            {
              x: 0,
              time: 400,
              text: 'Use A and D to move left and right.'
            },
            {
              x: 600,
              time: 250,
              text: 'Press SPACE to jump!'
            },
            {
              x: 1600,
              time: 200,
              text: 'Something\'s wrong here...'
            },
            {
              x: 4600,
              time: 200,
              text: 'Oh no! It can\'t be!'
            },
            {
              x: 6000,
              time: 200,
              text: 'I\'ve been shrunk!'
            },
            {
              x: 7700,
              time: 500,
              text: 'I don\'t remember what happened, but it probably\nhas something to do with the shrink ray I\'ve been working on.'
            },
            {
              x: 11500,
              time: 700,
              text: 'A lawn mite! CLICK to attack.'
            },
          ]
      }, // tutorial
      
      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 200,
          spawnY: -1000,
          ground: 
              '131 -4 +6 -3 -2 +3 +5 -3 +5 -3 -10 +10 -4 +7 -2 +4 +7 -7 +6 +6 -5 -5 +5 +4 -4 -3 +3 +4 -4 -3 -3 -3 -3 -3 -2 +2 -2 -3 +3 -3 +4 +4 +4 -5 +4 -4 +4 -4 +4 -4 +4 -4 -3 -3 -3 +3 -3 +3 +3 -4 -4 +4 +5 +5 -5 +6 +6 +6 +7 +7 -7 +7 +6 +6 -6 +6 +6 +6 +6 +5 -5 -5 -5 -5 -5 +5 +4 -4 -3 +3 -2 -2 -2 +2 +2 -3 -3 +3 -3 +2 +2 +3 -3 +3 -3 -3 -3 -4 -4 -4 +4 -5 -5 +5 +5 +5 -5 +5 -5 -6 +6 +6 +7 +7 -7 -7 +6 +5 +5 +4 -4 -3 -3 +3 -3 -3 -3 -3 +4 -4 -3 -3 -3 -3 -3 -3 +3 -3 -3 -3 -3 -3 +3 -4 -4 +4 +4 +3 +3 -3 +3 -3 -3 -3 -2 -2 +2 +2 +2 -2 +2 -2 +3 -3 -3 +3 -3 +3 +3 -3 +3 -3 -3 -3 -2 +2 -2 +2 -2 -2 +2 +2 -2 +1 +1 -1 +1 +1 +2 +2 +2 +2 -2 -2 -2 -2 +2 +2 +2 -2 -2 +2 -2 +2 +2 +3 -3 -3 -3 -3 -4 -4 +3 -3 -3 -3 +4 -4 +5 +5 +5 +5 +5 -5 +5 +6 -6 +6 -6 -6 +6 +6 -6 -6 +6 -6 -5 +5 -4 -5 -5 +5 +5 -5 -5 -5 +5 +5 -5 +5 +4 +4 -4 -4 +4 -4 -4 -4 +3 -3 -4 +4 -3 -3 +3 +4 +4 +4 +4 +4 +5 +5 -4 -4 +4 -4 -4 +4 +4 -4 -4 -4 +4 +4 -4 -4 +5 +5 +5 -6 -6 -6 -6 -6 -6 -6 -5 -5 +5 +5 +5 +5 +5 +5 +4 -4 +4 -4 +5 +5 +5 -5 +5 -5 -5 +5 -5 +6 -6 +6 -5 +5 -5 -5 +5 -5 +6 +15 +14 +13 +13 +12 -11 +11 +11 -10 -10 +9 -9 -9 -9 -9 -10 -11 -11 +11 -10 +10 +10 -10 -11 -11 +11 -11 +11 -12 -13 +14 -15 +16 +16 +17 -17 +17 +17 +16 -16 +16 +16 -16 +15 +15 +15 +14 -15 +15 +15 -14 -13'
                .split(' '),
          ponds: [
            new Pond(10000, 50, 6000),
          ],
          grounds: [

          ],
          circles: [
              new Circle(626, 1050, 60, color(170), color(150), 5),
              new Circle(700, 1120, 40, color(150), color(125), 5),
              new Circle(1200, 1050, 60, color(150), color(125), 5),
              new Circle(1560, 1150, 40, color(170), color(150), 5),
              new Circle(3010, 1000, 120, color(150), color(125), 5),
              new Circle(3200, 1050, 60, color(70), color(100), 5),
              new Circle(4500, 1000, 90, color(195), color(195), 5),
              new Circle(5900, 1050, 100, color(150), color(125), 5),
              new Circle(7260, 1100, 80, color(170), color(150), 5),
              new Circle(7460, 1100, 90, color(120), color(100), 5),
              new Circle(410, 1110, 70, color(150), color(125), 5),
          ],
          blocks: [

          ],
          text: [
            {
              x: 0,
              time: 300,
              text: 'I need to get back to my shrink ray to make myself bigger again.'
            },
            {
              x: 2000,
              time: 100,
              text: 'It\'s this way -->'
            },
          ]
      }, // map 1

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 0,
          spawnY: 0,
          ground: 
              '131 -2 -2 -2 -4 +1 +4 +3 +5 +10 -4 -5 +1 +4 +3 +5 -20 -32 -5 -3 -2 -2 -2 -15 -15 -66 -30 -3 +37 +10 +20 +30 +5 +8 +12 +12 +14 -2 +11 +20 +6 +10 -2 -4 -1 -4 -3 +5 -15 -12 -5 -1 -4 +1 -2 +3 -4 +2 -1 131 -2 -2 -2 -4 +1 +4 +3 +5 +10 -4 -5 +1 +4 +3 +5 -20 -32 -5 -3 -2 -2 -2 -15 -15 -66 -30 -3 +37 +10 +20 +30 +5 +8 +12 +12 +14 -2 +11 +20 +6 +10 -2 -4 -1 -4 -3 +5 -15 -12 -5 -1 -4 +1 -2 +3 -4 +2 -1 -1 -3 -5 -6 +7 +9 +10 +15 +1 -2 -4 +2 -4 -3 -5 -7 -10 +4 +6 -10 -3 +5 -3 +2 -6 +4 -12 +14 -2 +11 +20 +6 +10 -2 -4 -1 -4 -3 +5 -15 -12 -5 -1 -4 +1 -2 +3 -4 +2 -1 131 -2 -2 -2 -4 +1 +4 +3 +5 +10 -4 -5 +1 +4 +3 +5 -20 -32 -3 +17 -9 +0 +17 +17 -17 -4 +6 -9 +12 +9 +14 -0 +8 -13 -8 -7 -11 -2 +3 -4 -9 -2 -19 +3 -2 +11 -8 -13 -6 +8 +17 -7 -12 -18 +8 +16 +17 +19 +19 +0 +1 -12 +18 +0 -20 -40 -50 -60 -70 -30 -20 +3 -2 +5 -3 +6 -5 -3 +5 -2 +10 -5 +3 +20 +40 +70 +50 -3 +10 +20 +25 +20 +30 -2 +1 -5 +4 +3 -9 -16 +14 +16 -14 +3 +19 +17 +3 +9 +8 +15 +4 +3 +15 +0 -14 +18 +10 -18 +7 -4 -2 -11 +13 -14 -4 -18 -7 +13 +5 +10 -6 -5 +13 +5 -11 -20 -40 +2 -10 -20 -25 -5 +4 +5 -20 -30 +10 +20 -1 +5 +6 +20 -4 +45 +27 -2 -4 +5 +8 +10 +30 +10 -2 +4 -5 +10 +24 +40 +10 -5 -10 +10 +15 +20 +2 -11 -17 +19 -9 +23 -9 +14 +17 -22 +13 +0 -21 -36 -24 +36 +22 -22 +2 +20 +1 +4 -29 -1 -26 +23 +1 -33 +12 +18 -17 +36 +6 -0 -25 -29 -19 +4 -23 +18 +19 +22 +29 +5 +20 -13 +27 +36 +1 +14 +29 -10 -2 -36 -38 +17 -33 -0 -14 +36 +29 -24 -15 +26 -5 +31 +9 -19 -33 +6 -37 +5 +18 -20 +0 -6 +27 +18 -18 -13 -12 -39 +22 -27 -22 -19 -22 -27 -28 +25 +37 +18 +33 -37 +21 -20 +29 +17 -9 +16 +32 +8 -12 -28 -7 +5 -28 +34'
                .split(' '),
          grounds: [
              
          ],
          ponds: [
              new Pond(300, 0, 500),
              new Pond(5800, -100, 1300)
          ],
          circles: [
              new Circle(160, 1200, 40, color(170), color(150), 5),
              new Circle(310, 1100, 100, color(150), color(125), 5),
              new Circle(1210, 1050, 60, color(150), color(125), 5),
              new Circle(1560, 1150, 40, color(170), color(150), 5),
              new Circle(410, 1110, 70, color(150), color(125), 5),
              new Circle(1010, 1100-40, 100, color(150), color(125), 5),
              new Circle(360, 1160, 60, color(170), color(150), 5),
              new Circle(10, 1200, 150, color(150), color(125), 5),
              new Circle(1210, 1140, 50, color(150), color(125), 5),
              new Circle(1700, 1200, 100, color(100), color(125), 5),
              new Circle(2500, 1100, 200, color(50), color(70), 10),
              new Circle(2350, 1150, 100, color(100), color(125), 5),
              new Circle(3200, 1000, 250, color(200), color(150), 5),
              new Circle(3700, 1050, 90, color(60), color(20), 5),
              new Circle(5000, 1350, 150, color(180), color(140), 10),
              new Circle(5400, 1050, 90, color(60), color(20), 5),
              new Circle(5800, 970, 50, color(60), color(20), 5),
              new Circle(5900, 970, 70, color(90), color(120), 5),
          ],
          blocks: [
              
          ],
      }, // map 2

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 0,
          spawnY: 0,
          ground: 
              '131 +12 -12 -13 +13 -14 -14 +15 -16 -17 +18 -17 +16 -15 -14 +14 -13 -12 -12 -12 -11 +11 +12 -12 +13 +14 +14 -14 +14 -14 -14 +14 +15 +14 +14 -13 +12 +11 -10 -10 +10 +10 +10 +11 +11 +12 -12 -13 +14 +14 +15 +14 -14 +14 +14 +14 -14 -14 +14 +14 -14 +13 -12 +12 -12 +11 +10 +9 -8 +7 -6 +7 -8 +9 -10 +11 -11 -11 -11 -11 +11 +11 +11 -10 +10 +11 -11 -12 -13 +14 +14 -13 -13 +12 +11 +10 +10 -11 +11 +10 -9 -9 -9 +9 -9 -9 -9 -9 +9 -10 +10 +10 -11 -10 -9 -9 +9 -9 +10 +10 +10 -11 +11 +12 -13 +13 -13 +12 -11 -10 -9 -9 +10 +11 -12 +13 +14 +15 -15 -15 -16 +16 -17 -17 +18 +18 +18 -18 +19 +20 +20 -20 +20 -19 -18 -17 -17 -16 +14 -13 +12 +11 +10 -10 -9 -8 -7 +5 +5 -4 +4 +5 +5 +4 -4 +3 +4 -4 +5 +5 +4 -5 +6 -6 +7 -7 +7 +8 +8 -7 -6 -7 +8 -8 -8 +9 -9 +10 +10 -10 +11 -11 -12 +13 +13 +13 -13 -13 +13 -14 -14 +14 -14 -14 +13 +13 +14 +14 +14 +15 +15 +16 -16 -17 +18 -20 +20 -20 +21 -21 +22 +22 -21 -20 -18 -17 +17 -16 -16 +15 +15 +14 +14 +13 +12 -11 +12 -12 -12 +12 +12 -13 -13 +14 -15 -15 +16 +17 -18 -19 +20 +20 +20 -20 -20 -20 -21 -21 -21 -21 -20 +20 -21 +22 -21 +21 -20 -20 +19 +18 -17 +16 -15 -14 -12 +10 -10 -10 +10 -10 -10 -10 -10 -9 +9 -9 +9 -9 -10 +10 -10 +10 +11 -12 +12 -13 -14 -15 -15 -15 +15 -15 -15 +15 -14 +14 -14 +14 -11 -12 +12 -12 +11 -11 +11 +11 -11 -11 -10 +10 -9 +9 +9 -10 -10 +10 +10 -9 +9 +9 +8 -9 -10 -10 -11 -11 -10 +9 +8 -7 -7 +7 +7 +8 +8 -8 +7 -6 +5 -4 -4 -5 +6 +7 +7 +8 +8 +9 +9 -10 -11 +11 +12 -12 +14 -15 -16 +16 +17 -18 +18 -18 -19 -19 +19 +18 +17 -16 -14 -12 +11 -11 +11 -11 -11 +10 +10 -10 +9 -8 -8 +8 +10 +11 +11 +12 -13 +13 +13 -13 +13 +13 +12 +11 +10 -10 -9 +8 +8 +7 +7 +8 -9 -10 -10 +10 +11 -12 -12 +14 -15 +15 +14 +13 -12 +12 +12 +12 +12 -11 +11 -11 +11 +11 +12 +12 +12 +11 +11 +12 +13 +13 +14 +14 -15 -15 -15 +15 -16 +15 +15 -16 +16 +16 +15 +14 -15 -15 -15 +16 +16 +16 +16 -16 -16 -16 -15 +15 -15'
                .split(' '),
          grounds: [
              
          ],
          ponds: [
              new Pond(300, 10, 500),
              new Pond(4800, 0, 800)
          ],
          circles: [
              new Circle(560, 1200, 40, color(170), color(150), 5),
              new Circle(310, 1100, 100, color(150), color(125), 5),
              new Circle(1210, 1050, 60, color(150), color(125), 5),
              new Circle(1060, 1150, 40, color(170), color(150), 5),
              new Circle(410, 1110, 70, color(150), color(125), 5),
              new Circle(1010, 1100-40, 100, color(150), color(125), 5),
              new Circle(360, 1160, 60, color(170), color(150), 5),
              new Circle(1210, 1140, 50, color(150), color(125), 5),
              new Circle(1700, 1200, 100, color(100), color(125), 5),
              new Circle(2500, 1100, 200, color(50), color(70), 10),
              new Circle(2350, 1150, 100, color(100), color(125), 5),
              new Circle(3200, 1000, 250, color(200), color(150), 5),
              new Circle(3700, 1050, 90, color(60), color(20), 5),
              new Circle(5400, 1050, 90, color(60), color(20), 5),
              new Circle(5800, 1070, 50, color(60), color(20), 5),
              new Circle(5900, 1070, 70, color(90), color(120), 5),
          ],
          blocks: [
              
          ],
      }, // map 3

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 0,
          spawnY: 0,
          ground: 
              '131 -9 -8 -8 +7 -6 -6 -5 +5 -5 +5 -6 +6 +7 -7 -6 -5 -5 +5 +5 +6 +7 -8 +9 -10 -10 +10 -11 +11 +13 -14 -16 +16 +17 -18 +19 -20 +21 -21 -20 +19 -18 +18 +18 +18 +18 -18 +18 +17 -17 -18 -18 -19 -20 -20 +19 -19 -18 -17 -18 +19 -20 +20 -21 -21 +22 -22 -21 +20 +20 -19 +18 +17 +17 +16 +16 -16 -16 -16 +16 -16 +16 -15 +14 +14 +14 -13 +13 -12 -12 -12 +11 +11 -11 +11 -13 -13 -13 +12 -12 +12 +12 -12 +12 -12 -12 +12 -12 +12 -12 +13 -13 -14 -14 +13 -13 -12 -12 -12 -12 -11 +10 -9 -9 +8 -8 -7 -6 -5 +4 -4 -4 +5 -5 -5 +6 -6 -7 +7 +7 -7 +7 +8 +9 +9 -9 -10 -11 +11 +12 +13 +14 -15 +16 +17 +17 -17 -16 -15 +15 +15 +15 -15 -15 -14 -12 +12 -12 +11 +11 +12 -12 +13 +13 +13 -13 -13 -12 -12 -12 -12 +11 +10 +9 +9 +9 -8 +7 -7 -7 +8 -9 +9 -10 +10 +11 +11 -12 -13 +13 +12 -12 -12 +12 -12 +12 -13 -14 -14 -15 -15 +15 -16 +17 -18 +19 -20 -21 +22 +21 +20 -19 +19 +18 -18 -17 -17 -17 +16 -16 +16 -16 -16 +16 +16 +16 -16 +15 -15 -16 +17 +18 +18 -18 -18 -19 +19 -19 -20 +20 -20 -19 +18 -17 -17 +17 +17 +16 -16 +16 -17 +17 -17 +17 -18 +18 -19 -19 +19 -19 +20 -20 -20 +19 +20 -21 +21 +20 -20 -21 -21 +22 +21 -20 +20 +19 -18 -17 -17 +17 -18 +18 -17 -17 -16 -16 -16 +16 +16 +16 +16 -15 -14 +14 +16 -17 -18 +18 +18 -18 +19 -19 +18 +18 +17 -16 +16 +16 -16 -15 +15 +15 -15 +14 -14 -13 -13 -12 +12 -12 +12 +12 -12 +11 -11 +11 +11 +11 +11 -11 -10 -10 -10 +9 -9 -8 -7 -7 -7 -7 -8 +8 +8 +9 -10 -10 +11 -12 +13 +14 -13 +13 -13 +13 -12 +11 -10 -10 +11 -11 -10 +10 +9 +9 -8 +7 +7 -7 +7 -8 -8 +8 +8 -8 -9 +9 +11 -12 -13 -14 -16 +18 -18 +18 -18 -18 +18 -18 +19 +19 +19 +19 +20 +20 +20 +20 -21 -21 +20 +19 +19 -19 -19 -19 -19 -19 -19 +19 -20 +20 -20 +20 -20 +20 -20 +18 -18 -17 -16 +16 -15 -15 +14 -13 +13 -13 -14 -13 -13 -12 -12 +11 -12 +13 -14 -14 -14 +14 +14 -14 -14 +15 -14 -14 -14 +14 -13 +13 -12 -11 -12 +12 -12 -11 -10 +9 -8 -7 +7 -6 +6 +6 +6 +6 +7 -8 +8 -9 -9 -8 -9 +9 -9 +9 -9 -10 -10 -10 -11 -11 -11 +11 +11 -11 -10 +10 +10 +10 +10 +11 -11 -12 +11 -10'
                .split(' '),
          grounds: [
              
          ],
          ponds: [

          ],
          circles: [
              new Circle(760, 1200, 40, color(170), color(150), 5),
              new Circle(310, 1100, 100, color(150), color(125), 5),
              new Circle(1510, 1150, 60, color(150), color(125), 5),
              new Circle(660, 1150, 40, color(170), color(150), 5),
              new Circle(310, 1110, 70, color(150), color(125), 5),
              new Circle(160, 1160, 60, color(170), color(150), 5),
              new Circle(1010, 1140, 50, color(150), color(125), 5),
              new Circle(1300, 1200, 100, color(100), color(125), 5),
              new Circle(4350, 1250, 100, color(100), color(125), 5),
              new Circle(2700, 1250, 90, color(60), color(20), 5),
              new Circle(3400, 1250, 90, color(60), color(20), 5),
              new Circle(5800, 1370, 50, color(60), color(20), 5),
              new Circle(7900, 1470, 70, color(90), color(120), 5),
          ],
          blocks: [
              
          ],
      }, // map 4

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 0,
          spawnY: 0,
          ground: 
              '131 +6 +6 +7 +8 +9 +9 +9 +10 +11 +12 +12 +12 +12 +12 +12 +13 +13 +13 +14 +14 +14 +14 +13 +13 +13 +12 +12 +12 +12 +12 +12 +12 +12 +12 +12 +13 +14 +15 +15 +15 +15 +14 +14 +13 +13 +13 +12 +12 +12 +12 +11 +11 +10 +9 +9 +9 +9 +9 +9 +10 +9 +9 +9 +9 +8 +8 +8 +8 +9 +9 +9 +10 +11 +12 +12 +13 +14 +14 +14 +14 +14 +13 +13 +13 +12 +12 +12 +12 +12 +12 +12 +12 +11 +11 +11 +12 +12 +12 +12 +12 +12 +12 +12 +11 +11 +10 +10 +9 +9 +9 +9 +9 +9 +10 +10 +10 +11 +12 +12 +12 +12 +12 +11 +11 +11 +11 +10 +9 +9 +8 +8 +7 +7 +7 +7 +6 +6 +6 +6 +6 +6 +6 +6 +7 +7 +8 +8 +9 +9 +10 +10 +11 +11 +12 +12 +12 +12 +12 +12 +12 +12 +11 +11 +9 +9 +8 +8 +8 +8 +8 +8 +8 +8 +7 +7 +7 +8 +8 +9 +9 +9 +9 +8 +9 +9 +8 +9 +9 +8 +8 +9 +9 +10 +10 +10 +11 +10 +10 +10 +10 +10 +10 +10 +11 +10 +10 +9 +8 +8 +7 +7 +6 +6 +5 +4 +4 +3 +3 +3 +3 +3 +2 +2 +2 +2 +2 +2 +2 -5 -5 -5 -6 -6 -6 -6 -5 -5 -5 -5 -5 -5 -5 -5 -6 -6 -6 -6 -7 -7 -7 -7 -7 -7 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -6 -5 -5 -5 -5 -6 -6 -7 -8 -9 -10 -10 -10 -10 -10 -10 -10 -9 -9 -8 -8 -8 -9 -9 -9 -9 -9 -8 -7 -7 -7 -7 -7 -6 -6 -6 -6 -7 -7 -8 -8 -9 -10 -10 -10 -11 -11 -10 -10 -10 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -9 -10 -10 -10 -10 -10 -9 -9 -9 -9 -9 -9 -9 -9 -9 -8 -8 -9 -9 -9 -8 -8 -8 -8 -7 -7 -7 -7 -6 -7 -7 -8 -8 -8 -8 -7 -6 -6 -5 -5 -5 -6 -6 -6 -6 -6 -6 -5 -5 -5 -5 -5 -5 -5 -6 -7 -8 -9 -10 -11 -11 -12 -12 -12 -12 -11 -11 -10 -10 -10 -10 -11 -12 -13 -13 -13 -13 -13 -13 -13 -13 -14 -13 -13 -14 -15 -16 -16 -16 -16 -15 -14 -13 -12 -12 -13 -13 -13 -13 -13 -12 -12 -11 -11 -11 -11 -11 -11 -11 -11 -12 -12 -12 -11 -11 -12 -12 -11 -10 -10 -9 -9 -8 -7 -6 -6 -5 -5 -5 -6 -6 -6 -7 -7 -7 -8 -8 -9 -9'
                .split(' '),
          grounds: [
              
          ],
          ponds: [

          ],
          circles: [
              
          ],
          blocks: [
              
          ],

          grassDensity: 0.2,
      }, // map 5

      {
          
          groundCol: color(143, 113, 75),
          surfaceCol: color(173, 137, 92),
          surfaceThickness: 10,
          spawnX: 0,
          spawnY: 0,
          ground: 
              '131 +0 -1 -1 -2 -3 -3 +4 -4 -5 +6 -6 +5 +6 +6 +7 +8 -9 +10 +11 -11 +10 +9 -8 +8 -8 +8 -8 -9 +9 -10 +11 +11 -12 +13 -14 +15 +16 -17 +12 -18 -18 +17 -16 +14 -13 -12 +11 +11 +11 +11 -11 -10 -10 +10 -10 +10 +9 +9 -10 -10 +10 -10 +10 +10 +10 -11 +13 -13 +14 -14 +15 -16 +17 -18 -18 +19 +10 +11 +5 +9 +7 -5 -9 +10 +7 +6 -8 +9 +10 -12 -11 -10 -9 +9 +9 -9 -9 +10 +10 -10 +11 -11 +11 -12 +12 +11 +11 +10 +10 +10 -11 -11 -10 +10 +10 -11 -12 +13 +13 -12 +13 -13 -13 -13 +12 +12 -12 -12 -12 +12 +12 +13 +14 +10 +14 -14 +14 -13 -13 +13 -14 -15 -15 +16 -17 -10 -16 +17 +17 +17 +18 -18 -19 +19 -19 -20 +21 -22 +22 +23 -7 -7 -7 -7 -7 +7 -7 -8 -7 +7 -7 +7 +8 +9 +10 +10 +10 -10 +9 +9 +9 +9 +10 -10 +11 +12 -14 +15 +16 +17 -17 -17 -17 -17 -16 -16 +16 -16 -15 -15 +15 -15 +15 +15 +16 -16 +16 -16 +17 +18 -18 +19 +20 -21 -21 +22 +23 +23 +23 +22 +22 -21 -20 -19 +19 +18 -18 +17 -17 -16 +15 +14 -14 -14 -13 +12 +12 -12 +11 +11 '
                .split(' '),
          grounds: [
              
          ],
          ponds: [

          ],
          circles: [

          ],
          blocks: [
              
          ],
          text: [
            { x: 0, time: 100, text: 'I\'m almost to the shrink ray.'},
            { x: 1500, time: 100, text: 'I have a bad feeling about this...'},
            { x: 3000, time: 600, text: 'AAAUUUGGGHHH! That\'s a HUGE spider!!! Kill it!'}
          ],
          grassDensity: 0.3,
          boss: false,
          bossfight: true,
      }, // bossfight
        
  ];

  var player = new Player(maps[mapNum].spawnX, maps[mapNum].spawnY);

  for (let i = 0; i < maps.length; i++) {
    generateTerrain(maps[i])
  }
  createBlocks();

  let screen_width; let screen_height; let screen_scale;
  const setScreen = () => {
    if (window.innerWidth / window.innerHeight <= ASPECT_RATIO) {
      screen_width = window.innerWidth;
      screen_height = window.innerWidth * (1 / ASPECT_RATIO);
    } else {
      screen_width = ceil(window.innerHeight * ASPECT_RATIO);
      screen_height = window.innerHeight;
    }
    screen_scale = (screen_height / HEIGHT).toFixed(4);
  };
  window.windowResized = function () {
    setScreen();
    resizeCanvas(screen_width, screen_height);
  };

  let canvas
  window.setup = function () {
    setScreen()
    smooth()
    frameRate(60)
    canvas = createCanvas(screen_width, screen_height);
    canvas.style('display', 'block')
    textFont('Comic Sans MS')
    angleMode(DEGREES)
    frameRate(60)
    maps[0].enemies = [
      new Mite({ x: 12500, y: 500, }),
      new Mite({ x: 13500, y: 500, }),
      new Mite({ x: 14500, y: 500, }),
      new Mite({ x: 16500, y: 500, }),
    ]
    maps[1].enemies = [
      new Mite({ x: 1500, y: 500, }),
      new Mite({ x: 8000, y: 500, }),
      new Mite({ x: 3500, y: 500, }),
      new Mite({ x: 8500, y: 500, }),
      new Mite({ x: 3000, y: 500, }),
      new Mite({ x: 2000, y: 500, }),
      new Mite({ x: 7500, y: 500, }),
      new Bee({ x: 6800, y: 100 }),
      new JumpingSpider({ x: 7000, y: 500, }),
    ]
    maps[2].enemies = [
      new JumpingSpider({ x: 800, y: 500, }),
      new Mite({ x: 1500, y: 500, }),
      new Mite({ x: 4000, y: 500, }),
      new Mite({ x: 8000, y: 500, }),
      new Mite({ x: 3500, y: 500, }),
      new Mite({ x: 3000, y: 500, }),
      new Mite({ x: 8500, y: 500, }),
      new Bee({ x: 2800, y: 100 }),
      new Bee({ x: 2700, y: 800 }),
      new Bee({ x: 6800, y: 100 }),
      new Bee({ x: 6700, y: 800 }),
      new JumpingSpider({ x: 8000, y: 500, }),
      new JumpingSpider({ x: 5000, y: 500, }),
    ]
    maps[3].enemies = [
      new Mite({ x: 2000, y: 500, }),
      new Mite({ x: 5500, y: 500, }),
      new Mite({ x: 3000, y: 500, }),
      new Grasshopper({ x: 2500, y: 500 }),
      new JumpingSpider({ x: 5000, y: 500 }),
      new Grasshopper({ x: 7000, y: 500 }),
      new JumpingSpider({ x: 8000, y: 500 }),
    ]
    maps[4].enemies = [
      new Mite({ x: 2000, y: 500, }),
      new Mite({ x: 5500, y: 500, }),
      new Mite({ x: 3000, y: 500, }),
      new Mite({ x: 1500, y: 500, }),
      new Mite({ x: 1000, y: 500, }),
      new Grasshopper({ x: 3000, y: 500 }),
      new Bee({ x: 1500, y: 500 }),
      new Bee({ x: 2000, y: 500 }),
      new Bee({ x: 2500, y: 500 }),
      new Grasshopper({ x: 7000, y: 500 }),
      new Grasshopper({ x: 6000, y: 500 }),
      new JumpingSpider({ x: 7000, y: 500 }),
      new JumpingSpider({ x: 11000, y: 500 }),
      new JumpingSpider({ x: 10000, y: 500 }),
    ]
    maps[5].enemies = [
      new Ant ({ x: 1000, y: -1000 }),
      new Ant ({ x: 1300, y: -1000 }),
      new Ant ({ x: 1700, y: -1000 }),
      new Ant ({ x: 2200, y: -1000 }),
      new Ant ({ x: 3000, y: -1000 }),
      new Ant ({ x: 4000, y: -1000 }),
      new Ant ({ x: 5000, y: -1000 }),
      new Ant ({ x: 6000, y: -1000 }),
      new Ant ({ x: 7000, y: -1000 }),
      new Ant ({ x: 8000, y: -1000 }),
      new Ant ({ x: 9000, y: -1000 }),
      new Ant ({ x: 10000, y: -1000 }),
    ]
    maps[6].enemies = []
    maps.forEach(map => {
      let s = 4000
      for (let i = 0; i < map.ground.length * TERRAIN_DETAIL / s; i++) {
        //map.enemies.push(new Flea( { x: i * s, y: 500 } ))
      }
    })
    push()
      scale(screen_scale)
      background(0, 0)
      let spacing = 20
      let h = 0
      let rows = 12
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < WIDTH / spacing + 10; i++) {
          imageMode(CORNER)
          let img = images[([
            'grass1', 'grass2', 'grass3'
          ]).random()]
          h = img.height
          let f = (100 * j / rows)
          tint(120 + f, 120 + f, 255 - f, 255 - j * 10)
          image(img, i * spacing + (spacing * (j / rows)) - 100, 200 + random(0, 100) + j * 50)
          noTint()
        }
      }
      filter(BLUR, 2)
      grassBackground = get(0, 0, WIDTH * screen_scale, HEIGHT * screen_scale)
    pop()
    noTint()
    background(0)
    noStroke()
    fill(255)
    textSize(30)
    textAlign(CENTER, CENTER)
    text('Loading...\n\n(please wait)', window.innerWidth / 2, window.innerHeight / 2)
  };

  window.preload = function () {
    try {
      let k = Object.keys(images)
      let baseURL = './images/';
      // Relative path does not work inside Khan Academy
      console.log('Loading images for Khan Academy environment.');
      baseURL =  'https://raw.githubusercontent.com/Mushy-Avocado/Tiny/4b2b99db833875d9e2a2c4f0afd31ef458d14324/images/';
      for (let i = 0; i < k.length; i++) {
        images[k[i]] = loadImage(baseURL + images[k[i]])
      }
      k = Object.keys(sounds)
      for (let i = 0; i < k.length; i++) {
        sounds[k[i]] = {
          play: () => {}, 
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  const scenes = {}

  scenes.play = () => {

    // background
    background(119, 162, 217);
    imageMode(CORNER)
    image(grassBackground, 0, 0, WIDTH, HEIGHT)

    push();

        translate(-cam.x, -cam.y)
        shake.update()

        // Grass
        for (let i = 0; i < maps[mapNum].grass.front.length; i++) {
          let g = maps[mapNum].grass.front[i]
          let img = images[g.grassImg] 
          let w = img.width
          let h = img.height
          imageMode(CORNER)
          image(img, g.x + TERRAIN_DETAIL - w / 2, g.y - h + 150, 50)
        }

        // hills and boulders and stuff
        for(var i = maps[mapNum].circles.length - 1; i >= 0; i--) {
            var c = maps[mapNum].circles[i];
            c.display();
            c.collide(player);
            for (let i = 0; i < maps[mapNum].enemies.length; i++) {
              c.collide(maps[mapNum].enemies[i])
            }
        }

        // update player
        player.update();

        // Camera movement
        let x = player.prevX + player.w / 2 - WIDTH / 2
        let y = player.prevY + player.h / 2 - HEIGHT / 2
        let speed = 0.1 * delta() 
        cam.actualX = x
        cam.actualY = y
        cam.x = lerp(cam.x, x, speed);
        cam.y = lerp(cam.y, y, speed);
        let w = maps[mapNum].grounds.length * TERRAIN_DETAIL - WIDTH - 25
        cam.actualX = constrain(cam.actualX, 0, w)
        cam.x = constrain(cam.x, 0, w)

        player.display();

        // Draw enemies
        for (let i = 0; i < maps[mapNum].enemies.length; i++) {
          var e = maps[mapNum].enemies[i]
          if (!e.frozen) e.update()
          e.display()
          if (e.hp <= 0 && !e.frozen && !e.dead) {
            if (!e.boss) {
              maps[mapNum].enemies.splice(i, 1)
            } else {
              setTimeout(() => {
                e.dead = true
                e.frozen = false
                e.hit = true
                e.velX = 50
                e.velY = -50
              }, 1000)
              e.frozen = true
            }
          }
          if (DEBUG) {
            noFill()
            stroke(1)
            rect(e.x, e.y, e.w, e.h)
          }
        }

        if (maps[mapNum].boss === false) {
          maps[mapNum].enemies[0] = new Boss({ x: 4000, y: 500, })
          maps[mapNum].boss = true
        }
        
        // Draw water
        var inWater = false;
        for(var i = maps[mapNum].ponds.length - 1; i >= 0; i--) {
            var p = maps[mapNum].ponds[i];
            
            // Display pond
            p.display();
            
            // If player inside pond
            if(maps[mapNum].ponds[i].collide(player)) {
                
                player.movement = 'swimming';
                inWater = true;
                player.holdingBreath = true;
                player.temp -= 0.05;
                
                // If on surface, not holding breath
                if(player.y + 15 < maps[mapNum].ponds[i].y) {
                    player.holdingBreath = false;  
                }
            }
        }
        
        // Draw grass in front
        for (let i = 0; i < maps[mapNum].grass.back.length; i++) {
          let g = maps[mapNum].grass.back[i]
          let img = images[g.grassImg] 
          let w = img.width
          let h = img.height
          imageMode(CORNER)
          image(img, g.x + TERRAIN_DETAIL - w / 2, g.y - h + 100, 50)
        }

        // If not in any water, player is walking
        if(!inWater && player.movement === 'swimming') {
            player.movement = 'walk';   
            player.holdingBreath = false;
        }
        
        // Ground
        fill(maps[mapNum].groundCol);
        stroke(maps[mapNum].surfaceCol);
        strokeWeight(maps[mapNum].surfaceThickness);

        beginShape();
            vertex((maps[mapNum].grounds.length - 1) * TERRAIN_DETAIL, 6000);
            for(var i = maps[mapNum].grounds.length - 1; i >= 0; i--) {
                vertex(maps[mapNum].grounds[i].x, maps[mapNum].grounds[i].y);
            }
            vertex(-50, maps[mapNum].grounds[0].y);
            vertex(-50, 6000);
        endShape();
        
        // Debug wire frame
        if(DEBUG) {
            for(var i = maps[mapNum].grounds.length - 1; i >= 0; i--) {
                stroke(0);
                strokeWeight(1);
                rect(maps[mapNum].grounds[i].x, maps[mapNum].grounds[i].y, TERRAIN_DETAIL, 1000);
            }
            
            // Frames per second
            fill(255);
            textAlign(RIGHT, TOP);
            textSize(15);
            
        }
    
        particles.draw()

    pop();

    player.drawBars()

    // Draw weapon unlocks
    weaponsMenu.button()
    weaponsMenu.draw()

    // Draw text
    if (maps[mapNum].text !== void 0) {
      let num = 0
      let t = maps[mapNum].text
      t.forEach(txt => {
        if (player.x > txt.x) {
          txt.time -= delta()
          if (txt.time > 0) {
            num += 1
            fill(0)
            noStroke()
            textAlign(CENTER, TOP)
            textSize(30)
            text(txt.text, WIDTH / 2, HEIGHT - 450 + 40 * num)
          }
        }
      })
    }

    if (player.hp <= 0) {
      death.reset()
      scene = 'deathTrans'
      sounds.die.play()
      player.respawn()
      if (maps[mapNum].boss) {
        maps[mapNum].boss = false
      }
      player.hp = 100
    }
    
    // Go to next map
    if (maps[mapNum].enemies.length > 0) {
      let b = maps[mapNum].enemies[0]
      if (maps[mapNum].bossfight && b.hp <= 0 && b.y <= 200 && b.x + b.w > maps[mapNum].grounds.length * TERRAIN_DETAIL - 150) {
        maps[mapNum].enemies.length = 0
        shake.new(200)
      }
    }
    if (player.x > maps[mapNum].grounds.length * TERRAIN_DETAIL - 150) {
      if (mapNum === maps.length - 1 && (maps[mapNum].bossfight && maps[mapNum].enemies.length === 0)) {
        fade.set('win', () => {
          setTimeout(() => {
            squish.show = true
          }, 6000)
        })
      }
      let obj = { x: 0, timer: 300, text: 'You have to kill all the bugs to move on.' }
      if (!maps[mapNum].bossfight && mapNum < maps.length - 1) {
        if (maps[mapNum].enemies.length === 0) {
          fade.set('play', () => {
            mapNum++
            player.respawn()
          })
        }
      }
    }

  }


  let death = {
    img: void 0,
    fade: 0,
    reset: function () {
      this.img = get()
      this.fade = -200
    },
  }
  scenes.deathTrans = () => {
    death.fade += 3
    imageMode(CORNER)
    image(death.img, 0, 0, WIDTH, HEIGHT)
    fill(255, 0, 0, death.fade)
    noStroke()
    rect(-1, -1, WIDTH + 2, HEIGHT + 2)
    if (death.fade > 100) {
      scene = 'play'
    }
  }

  let fade = {
    num: 0,
    target: null,
    dir: 1,
    speed: 5,
    onTrans: null,
    'set': function (target, onTrans) {
      if (!this.fading) {
        this.target = target
        this.num = 0
        this.dir = 1
        this.fading = true
        this.onTrans = onTrans
      }
    },
    display: function () {
      if (this.fading) {
        this.num += this.dir * this.speed * delta()
        if (this.num > 255) {
          this.dir = -1
          scene = this.target
          if(this.onTrans) this.onTrans()
        }
        if (this.num <= 0 && this.dir === -1) {
          this.fading = false
        }
        fill(0, this.num)
        noStroke()
        rect(0, 0, WIDTH, HEIGHT)
      }
    },
  }
  scenes.menu = () => {
    imageMode(CORNER)
    let img = images.mainMenu 
    image(img, 0, 0, WIDTH, HEIGHT)
    if (keyIsPressed) {
      fade.set('play')
    }
  }

  let squish = {
    start: false,
    y: -500,
    target: 720,
    dropping: true,
    timeout: false,
  }
  scenes.win = () => {
    push()
      shake.update()
      imageMode(CORNER)
      image(images.endScene, -1, -1, WIDTH + 2, HEIGHT + 2)
      if (mouseWasClicked) {
        squish.start = true
        squish.show = false
      }
      if (squish.start) {
        let img = images.foot
        push()
          translate(600, squish.y - img.height)
          image(img, 0, 0)
        pop()
        if (squish.dropping) {
          squish.y += 50
        }
        if (squish.y > squish.target) {
          squish.y = squish.target
          squish.dropping = false
          shake.new(400)
          sounds.dramatic.play()
          setTimeout(() => {
            scene = 'end'
          }, 1000)
        }
      }
    pop()
  }

  let end = {
    timer: 100,
  }
  scenes.end = () => {
    background(0)
    end.timer -= delta()
    if (end.timer <= 0) {
      fill(255)
      textAlign(CENTER, CENTER)
      textSize(30)
      noStroke()
      push()
        translate(WIDTH / 2, HEIGHT / 2)
        rotate(cos(frameCount * 2) * 5)
        scale(1 + sin(frameCount * -2) * 0.05)
        text('Thanks for playing!\nStay tuned for more content!\n\nCredits\n\nP5.js\nP5.sound.js\nP5.collide2D\nAll other code by Mushy Avocado\n\nPlaytesters\n\nFluffy Sheep\nJU5T.', 0, 0)
      pop()
    }
  }

  let fps = 0
  setInterval(() => {
    fps = ~~frameRate()
  }, 1000)
  window.draw = function() {

      try {
      
          // set mouse position
          mouse.x = mouseX * (1 / screen_scale)
          mouse.y = mouseY * (1 / screen_scale)

          push();

            // Scale down to fit
            scale(screen_scale);
            
            scenes[scene]()
            fade.display()

            fill(0, 255, 0)
            noStroke()
            textAlign(LEFT, TOP)
            textSize(20)
            text(fps, 0, 0)

            mouseWasClicked = false;

          pop();
      
      } catch (e) { print(e); }
      
  };
  let audioStarted = false
  window.mouseClicked = function () {
    mouseWasClicked = true;
  };

})()
