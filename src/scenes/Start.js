export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('backgroundgames1', 'assets/BG1.png');
        this.load.image('backgroundgames2', 'assets/BG2.png');

        this.load.image('openover', 'assets/openover.png');
        this.load.image('closeover', 'assets/closeover.png');

        this.load.image('LuvaGirl', 'assets/LuvaGirl.png');
        this.load.image('LuvaGirlBad', 'assets/Luvagirlbad.png');
        this.load.image('LuvaGirlBonus', 'assets/Luvagirlbonus.png');

        this.load.image('heartBlue', 'assets/blue.png');
        this.load.image('heartGreen', 'assets/green.png');
        this.load.image('heartPink', 'assets/pink.png');
        this.load.image('heartYellow', 'assets/yellow.png');

        this.load.image('lifeFull', 'assets/lifescore.png');
        this.load.image('lifeLost', 'assets/lostscore.png');

        this.load.image('tomato', 'assets/Tomotoe.png');
        this.load.image('grammy', 'assets/grammy.png');
        this.load.image('ramenItem', 'assets/ramen.png');
        this.load.image('noteItem', 'assets/note.png');

        this.load.audio('gameOverSound', 'assets/GameOver.mp3');
        this.load.audio('bgMusic', 'assets/BGmusic.mp3');
    }

    create() {
        this.gameWidth = 360;
        this.gameHeight = 640;

        this.background = this.add.tileSprite(180, 320, 360, 640, 'backgroundgames1');

        this.gameStarted = false;
        this.isGameOver = false;
        this.reactionTimer = null;

        this.ship = this.add.image(180, 550, 'LuvaGirl').setScale(0.22);
        this.shipBaseY = 550;

        this.cursors = this.input.keyboard.createCursorKeys();

        // mobile touch / drag controls
        this.input.on('pointerdown', (pointer) => {
            if (this.gameStarted && !this.isGameOver) {
                this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
            }
        });

        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && this.gameStarted && !this.isGameOver) {
                this.ship.x = Phaser.Math.Clamp(pointer.x, 30, 330);
            }
        });

        this.items = this.add.group();

        this.heartsCaught = 0;
        this.lives = 3;
        this.currentFallSpeed = 2;

        this.starLevelShown = false;
        this.superStarShown = false;
        this.iconLevelShown = false;
        this.legendaryShown = false;

        this.currentLevelName = 'Luva Girl';

        this.grammyUnlocked = false;
        this.grammySpawned = false;
        this.grammyCaught = false;

        this.musicSpawnCount = 0;
        this.ramenSpawnCount = 0;
        this.maxMusicSpawns = 3;
        this.maxRamenSpawns = 3;

        this.heartKeys = ['heartBlue', 'heartGreen', 'heartPink', 'heartYellow'];

        this.bgMusic = null;
        this.lifeIcons = [];

        this.catchZoneY = this.ship.y + 28;
        this.catchZoneBottom = this.ship.y + 48;

        this.spawnTimer = null;
        this.extraSpawnTimer = null;

        // fixed lanes help keep the game dodgeable
        this.spawnLanes = [52, 92, 132, 180, 228, 268, 308];
        this.lastSpawnLane = null;
        this.lastTomatoLane = null;
        this.lastSpawnType = null;

        this.createStartScreen();
    }

    createStartScreen() {
        this.startTitle = this.add.text(180, 92, 'Coco Jones\nLuva Girl', {
            fontSize: '30px',
            align: 'center',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 14,
                fill: true
            }
        }).setOrigin(0.5);

        this.howToTitle = this.add.text(180, 154, 'HOW TO PLAY', {
            fontSize: '18px',
            align: 'center',
            color: '#6d3bb8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.howToLine1 = this.add.text(180, 194, '♥ Drag left and right\nto catch hearts.', {
            fontSize: '14px',
            align: 'center',
            color: '#6d3bb8',
            lineSpacing: 6,
            fontStyle: 'bold',
            wordWrap: { width: 142, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.howToLine2 = this.add.text(180, 250, '♥ Avoid the tomatoes.', {
            fontSize: '14px',
            align: 'center',
            color: '#6d3bb8',
            lineSpacing: 6,
            fontStyle: 'bold',
            wordWrap: { width: 142, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.howToLine3 = this.add.text(180, 298, '♥ Catch special items\nfor a bonus!', {
            fontSize: '14px',
            align: 'center',
            color: '#6d3bb8',
            lineSpacing: 6,
            fontStyle: 'bold',
            wordWrap: { width: 142, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.madeByStart = this.add.text(180, 346, 'Made by Source', {
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#6d3bb8',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#6d3bb8',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);

        this.presaveButton = this.add.text(180, 372, 'Presave Luva Girl', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffd6f2',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.addButtonFeedback(this.presaveButton, () => {
            window.open('https://link.fans/luvagirl', '_blank');
        }, '#ffd6f2', '#c8a2ff');

        this.startButton = this.add.text(180, 420, 'Start Game', {
            fontSize: '22px',
            backgroundColor: '#333',
            padding: { left: 15, right: 15, top: 10, bottom: 10 },
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.addButtonFeedback(this.startButton, () => {
            this.startGame();
        }, '#ffff00', '#ff69b4');
    }

    addButtonFeedback(button, onPress, baseColor, hoverColor = '#ff69b4') {
        const baseScale = 1;

        button.on('pointerdown', () => {
            button.setColor(hoverColor);
            button.setScale(baseScale * 0.96);
            onPress();
        });

        button.on('pointerup', () => {
            button.setScale(baseScale);
        });

        button.on('pointerout', () => {
            button.setColor(baseColor);
            button.setScale(baseScale);
        });

        button.on('pointerover', () => {
            button.setColor(hoverColor);
        });
    }

    startGame() {
        this.gameStarted = true;

        this.startTitle.destroy();
        this.howToTitle.destroy();
        this.howToLine1.destroy();
        this.howToLine2.destroy();
        this.howToLine3.destroy();
        this.madeByStart.destroy();
        this.startButton.destroy();
        this.presaveButton.destroy();

        this.setupHUD();
        this.startBackgroundMusic();

        // main spawn
        this.spawnTimer = this.time.addEvent({
            delay: 560,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true
        });

        // extra controlled spawn so the screen doesn't feel empty,
        // while still keeping the game dodgeable
        this.extraSpawnTimer = this.time.addEvent({
            delay: 980,
            callback: () => {
                if (this.isGameOver) return;

                let activeFalling = 0;

                this.items.children.iterate((item) => {
                    if (!item || !item.active) return;
                    if (item.y < this.catchZoneY - 40) {
                        activeFalling += 1;
                    }
                });

                if (activeFalling < 2) {
                    this.spawnItem();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    startBackgroundMusic() {
        if (this.sound && this.cache.audio.exists('bgMusic')) {
            if (!this.bgMusic || !this.bgMusic.isPlaying) {
                this.bgMusic = this.sound.add('bgMusic', {
                    loop: true,
                    volume: 0.55
                });
                this.bgMusic.play();
            }
        }
    }

    setupHUD() {
        this.add.text(10, 8, 'Coco Jones', {
            fontSize: '12px',
            color: '#ffffff'
        });

        this.add.text(10, 22, 'Luva Girl', {
            fontSize: '12px',
            color: '#ffffff'
        });

        this.heartsLabelText = this.add.text(180, 8, 'Hearts', {
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5, 0);

        this.heartsNumberText = this.add.text(180, 24, '0', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5, 0);

        this.createLifeIcons();

        this.endGameButton = this.add.text(332, 48, 'End', {
            fontSize: '12px',
            color: '#ffff00',
            backgroundColor: '#333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 },
            stroke: '#ff69b4',
            strokeThickness: 1,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 8,
                fill: true
            }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

        this.endGameButton.on('pointerdown', () => {
            this.endGame();
        });

        this.endGameButton.on('pointerover', () => {
            this.endGameButton.setColor('#ff69b4');
        });

        this.endGameButton.on('pointerout', () => {
            this.endGameButton.setColor('#ffff00');
        });
    }

    createLifeIcons() {
        this.lifeIcons = [];

        const startX = 290;
        const y = 20;
        const spacing = 28;

        for (let i = 0; i < 3; i++) {
            const icon = this.add.image(startX + (i * spacing), y, 'lifeFull')
                .setScale(0.2)
                .setOrigin(0.5, 0.5);

            this.lifeIcons.push(icon);
        }
    }

    updateLivesDisplay() {
        for (let i = 0; i < this.lifeIcons.length; i++) {
            if (i < this.lives) {
                this.lifeIcons[i].setTexture('lifeFull');
            } else {
                this.lifeIcons[i].setTexture('lifeLost');
            }
        }
    }

    update() {
        if (!this.gameStarted) return;
        if (this.isGameOver) return;

        if (this.cursors.left.isDown) this.ship.x -= 5;
        if (this.cursors.right.isDown) this.ship.x += 5;

        if (this.ship.x < 30) this.ship.x = 30;
        if (this.ship.x > 330) this.ship.x = 330;

        this.items.children.iterate((item) => {
            if (!item || !item.active) return;

            item.y += item.speed;

            if (item.angleSpeed) {
                item.angle += item.angleSpeed;
            }

            if (item.pulseSpeed) {
                item.pulseTime += item.pulseSpeed;
                const scaleOffset = Math.sin(item.pulseTime) * item.pulseAmount;
                item.setScale(item.baseScale + scaleOffset);
            }

            if (item.y > this.catchZoneBottom) {
                item.safePassed = true;
            }

            if (item.y > this.gameHeight + 70) {
                item.destroy();
                return;
            }

            if (item.safePassed) {
                return;
            }

            const catchX = this.ship.x;
            const catchY = this.catchZoneY;

            const dx = Math.abs(item.x - catchX);
            const dy = Math.abs(item.y - catchY);

            if (dx < item.catchWidth && dy < item.catchHeight) {
                this.handleCaughtItem(item);
            }
        });

        this.checkLevelProgress();
    }

    getSpawnX(type) {
        let laneChoices = [...this.spawnLanes];

        if (type === 'tomato') {
            if (this.lastTomatoLane !== null) {
                laneChoices = laneChoices.filter((_, index) => Math.abs(index - this.lastTomatoLane) >= 2);
            }

            if (laneChoices.length === 0) {
                laneChoices = [...this.spawnLanes];
            }
        } else {
            if (this.lastSpawnLane !== null) {
                laneChoices = laneChoices.filter((_, index) => index !== this.lastSpawnLane);
            }

            if (laneChoices.length === 0) {
                laneChoices = [...this.spawnLanes];
            }
        }

        const x = Phaser.Utils.Array.GetRandom(laneChoices);
        const laneIndex = this.spawnLanes.indexOf(x);

        this.lastSpawnLane = laneIndex;

        if (type === 'tomato') {
            this.lastTomatoLane = laneIndex;
        } else if (type !== 'grammy') {
            this.lastTomatoLane = null;
        }

        return x;
    }

    spawnItem() {
        if (this.isGameOver) return;

        const type = this.chooseItemType();
        const x = this.getSpawnX(type);

        let item;

        if (type === 'heart') {
            const randomHeart = Phaser.Utils.Array.GetRandom(this.heartKeys);
            item = this.add.image(x, -34, randomHeart).setScale(0.24);
            item.itemKind = 'good';
            item.itemValue = 1;
            item.itemType = 'heart';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 38;
            item.catchHeight = 34;
            item.angleSpeed = 0.12;
            item.baseScale = 0.24;
            item.safePassed = false;
        }

        if (type === 'tomato') {
            item = this.add.image(x, -34, 'tomato').setScale(0.23);
            item.itemKind = 'bad';
            item.itemValue = 1;
            item.itemType = 'tomato';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 28;
            item.catchHeight = 28;
            item.angleSpeed = -0.18;
            item.baseScale = 0.23;
            item.safePassed = false;
        }

        if (type === 'ramen') {
            item = this.add.image(x, -34, 'ramenItem').setScale(0.22);
            item.itemKind = 'good';
            item.itemValue = 2;
            item.itemType = 'ramen';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 34;
            item.catchHeight = 32;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
        }

        if (type === 'music') {
            item = this.add.image(x, -34, 'noteItem').setScale(0.22);
            item.itemKind = 'good';
            item.itemValue = 2;
            item.itemType = 'music';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 34;
            item.catchHeight = 32;
            item.angleSpeed = 0.18;
            item.baseScale = 0.22;
            item.safePassed = false;
        }

        if (type === 'grammy') {
            item = this.add.image(x, -38, 'grammy').setScale(0.3);
            item.itemKind = 'bonus';
            item.itemValue = 10;
            item.itemType = 'grammy';
            item.speed = this.currentFallSpeed;
            item.catchWidth = 40;
            item.catchHeight = 36;
            item.angleSpeed = 0.35;
            item.baseScale = 0.3;
            item.pulseSpeed = 0.18;
            item.pulseAmount = 0.02;
            item.pulseTime = 0;
            item.safePassed = false;

            if (item.preFX) {
                item.preFX.addGlow(0x8fdcff, 10, 0, false, 0.15, 16);
            }
        }

        if (!item) return;

        this.lastSpawnType = type;
        this.items.add(item);
    }

    chooseItemType() {
        if (this.grammyUnlocked && !this.grammySpawned && !this.grammyCaught) {
            const grammyRoll = Phaser.Math.Between(1, 100);
            if (grammyRoll <= 12) {
                this.grammySpawned = true;
                return 'grammy';
            }
        }

        if (this.heartsCaught < 5) {
            return 'heart';
        }

        const roll = Phaser.Math.Between(1, 100);
        const isIconStage = this.heartsCaught >= 60;

        if (!this.superStarShown) {
            if (roll <= 60) return 'heart';
            return 'tomato';
        }

        if (!isIconStage) {
            if (roll <= 54) return 'heart';

            if (roll <= 57) {
                if (this.ramenSpawnCount < this.maxRamenSpawns) {
                    this.ramenSpawnCount += 1;
                    return 'ramen';
                }
                return 'heart';
            }

            if (roll <= 60) {
                if (this.musicSpawnCount < this.maxMusicSpawns) {
                    this.musicSpawnCount += 1;
                    return 'music';
                }
                return 'heart';
            }

            return 'tomato';
        }

        if (roll <= 34) return 'heart';

        if (roll <= 37) {
            if (this.ramenSpawnCount < this.maxRamenSpawns) {
                this.ramenSpawnCount += 1;
                return 'ramen';
            }
            return 'heart';
        }

        if (roll <= 40) {
            if (this.musicSpawnCount < this.maxMusicSpawns) {
                this.musicSpawnCount += 1;
                return 'music';
            }
            return 'heart';
        }

        return 'tomato';
    }

    handleCaughtItem(item) {
        const kind = item.itemKind;
        const value = item.itemValue;
        const x = item.x;
        const y = item.y;

        item.destroy();

        if (kind === 'good') {
            this.heartsCaught += value;
            this.heartsNumberText.setText(String(this.heartsCaught));

            if (item.itemType === 'ramen' || item.itemType === 'music') {
                this.showPlayerReaction('bonus');
            }

            if (value === 2) {
                this.showFloatingScore('+2');
            } else {
                this.showFloatingScore('+1');
            }
            return;
        }

        if (kind === 'bonus') {
            this.heartsCaught += value;
            this.heartsNumberText.setText(String(this.heartsCaught));
            this.grammyCaught = true;
            this.showCenteredFloatingScore('Grammy Bonus +10');
            this.showGrammySparkles(x, y);
            this.showPlayerReaction('bonus');
            this.triggerVibration([80, 40, 120]);
            return;
        }

        if (kind === 'bad') {
            this.lives -= 1;
            this.updateLivesDisplay();
            this.showPlayerReaction('bad');
            this.showBadPenalty();
            this.triggerVibration(140);

            if (this.lives <= 0) {
                this.endGame();
            }
        }
    }

    showPlayerReaction(type) {
        if (!this.ship || !this.ship.active || this.isGameOver) return;

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        this.tweens.killTweensOf(this.ship);
        this.ship.angle = 0;
        this.ship.y = this.shipBaseY;

        if (type === 'bad') {
            this.ship.setTexture('LuvaGirlBad');
            this.ship.setScale(0.22);

            this.tweens.add({
                targets: this.ship,
                angle: { from: -6, to: 6 },
                duration: 90,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    if (this.ship && this.ship.active && !this.isGameOver) {
                        this.ship.angle = 0;
                    }
                }
            });
        }

        if (type === 'bonus') {
            this.ship.setTexture('LuvaGirlBonus');
            this.ship.setScale(0.23);

            this.tweens.add({
                targets: this.ship,
                y: this.shipBaseY - 8,
                duration: 120,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    if (this.ship && this.ship.active && !this.isGameOver) {
                        this.ship.y = this.shipBaseY;
                    }
                }
            });
        }

        this.reactionTimer = this.time.addEvent({
            delay: 450,
            callback: () => {
                if (this.ship && this.ship.active && !this.isGameOver) {
                    this.ship.setTexture('LuvaGirl');
                    this.ship.setScale(0.22);
                    this.ship.angle = 0;
                    this.ship.y = this.shipBaseY;
                }
            }
        });
    }

    showGrammySparkles(x, y) {
        for (let i = 0; i < 6; i++) {
            const sparkle = this.add.text(
                x + Phaser.Math.Between(-20, 20),
                y + Phaser.Math.Between(-20, 20),
                '✨',
                { fontSize: '20px' }
            ).setOrigin(0.5);

            this.tweens.add({
                targets: sparkle,
                x: sparkle.x + Phaser.Math.Between(-25, 25),
                y: sparkle.y + Phaser.Math.Between(-35, 10),
                alpha: 0,
                scale: 1.3,
                duration: 700,
                onComplete: () => sparkle.destroy()
            });
        }
    }

    checkLevelProgress() {
        if (this.heartsCaught >= 100 && !this.legendaryShown) {
            this.legendaryShown = true;
            this.currentLevelName = 'Legendary Level';
            this.showLevelMessage('Legendary Level Reached');
            return;
        }

        if (this.heartsCaught >= 60) {
            this.currentFallSpeed = 8;

            if (!this.iconLevelShown) {
                this.iconLevelShown = true;
                this.currentLevelName = 'ICON Level';
                this.showLevelMessage('ICON Level Reached');
            }
            return;
        }

        if (this.heartsCaught >= 30 && !this.superStarShown) {
            this.superStarShown = true;
            this.currentLevelName = 'Super Star Level';
            this.grammyUnlocked = true;
            this.background.setTexture('backgroundgames2');
            this.showLevelMessage('Super Star Level Reached');
            return;
        }

        if (this.heartsCaught >= 20) {
            this.currentFallSpeed = 6;
        }

        if (this.heartsCaught >= 15 && !this.starLevelShown) {
            this.starLevelShown = true;
            this.currentLevelName = 'Star Level';
            this.showLevelMessage('Star Level Reached');
            return;
        }

        if (this.heartsCaught >= 5) {
            this.currentFallSpeed = 4;
        }
    }

    showLevelMessage(text) {
        const levelText = this.add.text(180, 245, text, {
            fontSize: '24px',
            color: '#ffff66',
            stroke: '#ff69b4',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 16,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: levelText,
            alpha: 0,
            scale: 1.08,
            delay: 1000,
            duration: 900,
            onComplete: () => { levelText.destroy(); }
        });
    }

    showFloatingScore(text) {
        const msg = this.add.text(this.ship.x, this.ship.y - 95, text, {
            fontSize: '22px',
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffff66',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => { msg.destroy(); }
        });
    }

    showCenteredFloatingScore(text) {
        const msg = this.add.text(180, this.ship.y - 95, text, {
            fontSize: '22px',
            color: '#ffff66',
            stroke: '#000',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ffff66',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 55,
            alpha: 0,
            duration: 1200,
            onComplete: () => { msg.destroy(); }
        });
    }

    showBadPenalty() {
        const msg = this.add.text(this.ship.x, this.ship.y - 100, '-1 Eeyuck', {
            fontSize: '22px',
            color: '#ff4d4d',
            stroke: '#4b0000',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff4d4d',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: msg,
            y: msg.y - 45,
            alpha: 0,
            duration: 1100,
            onComplete: () => { msg.destroy(); }
        });
    }

    triggerVibration(pattern) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    endGame() {
        if (this.isGameOver) return;

        this.isGameOver = true;

        if (this.spawnTimer) this.spawnTimer.remove(false);
        if (this.extraSpawnTimer) this.extraSpawnTimer.remove(false);

        if (this.reactionTimer) {
            this.reactionTimer.remove(false);
            this.reactionTimer = null;
        }

        this.items.children.iterate((item) => {
            if (item) item.destroy();
        });

        if (this.endGameButton) {
            this.endGameButton.destroy();
        }

        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        if (this.sound && this.cache.audio.exists('gameOverSound')) {
            this.sound.play('gameOverSound');
        }

        const levelText = this.getFinalLevelName();

        this.add.rectangle(180, 320, 300, 420, 0x000000, 0.9);

        this.gameOverHead = this.add.image(180, 150, 'openover')
            .setScale(0.32);

        this.tweens.add({
            targets: this.gameOverHead,
            angle: { from: -4, to: 4 },
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.gameOverBlinkTimer = this.time.addEvent({
            delay: 650,
            loop: true,
            callback: () => {
                if (!this.gameOverHead || !this.gameOverHead.active) return;

                const currentTexture = this.gameOverHead.texture.key;
                if (currentTexture === 'openover') {
                    this.gameOverHead.setTexture('closeover');
                } else {
                    this.gameOverHead.setTexture('openover');
                }
            }
        });

        this.add.text(180, 220, 'Heartbroken\nGame Over', {
            fontSize: '24px',
            color: '#ff9db2',
            align: 'center',
            stroke: '#4b1e6d',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 16,
                fill: true
            }
        }).setOrigin(0.5);

        this.add.text(180, 295, 'Hearts Collected', {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        this.add.text(180, 330, String(this.heartsCaught), {
            fontSize: '34px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);

        this.add.text(180, 370, levelText, {
            fontSize: '18px',
            color: '#fff',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5);

        this.add.text(180, 420, 'Presave Luva Girl', {
            fontSize: '18px',
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                window.open('https://link.fans/luvagirl', '_blank');
            })
            .on('pointerover', function () { this.setColor('#ff69b4'); })
            .on('pointerout', function () { this.setColor('#ffff00'); });

        this.add.text(180, 448, 'Made by Source', {
            fontSize: '14px',
            color: '#fff'
        }).setOrigin(0.5);

        const playAgain = this.add.text(180, 500, 'Play Again', {
            fontSize: '18px',
            backgroundColor: '#555',
            padding: { left: 10, right: 10, top: 6, bottom: 6 },
            color: '#ffff00',
            stroke: '#ff69b4',
            strokeThickness: 2,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#ff69b4',
                blur: 12,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        playAgain.on('pointerdown', () => {
            this.scene.restart();
        });

        playAgain.on('pointerover', () => {
            playAgain.setColor('#ff69b4');
        });

        playAgain.on('pointerout', () => {
            playAgain.setColor('#ffff00');
        });
    }

    getFinalLevelName() {
        if (this.heartsCaught >= 100) return 'Legendary Level';
        if (this.heartsCaught >= 60) return 'ICON Level';
        if (this.heartsCaught >= 30) return 'Super Star Level';
        if (this.heartsCaught >= 15) return 'Star Level';
        return 'Luva Girl';
    }
}
