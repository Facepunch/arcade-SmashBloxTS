/// <reference path="GameEntity.ts"/>

class CollisionResult {
    private _normal: GameAPI.Vector2f;

    hit: boolean;
    phase: number;
    blocks: GameAPI.Vector2i[];

    constructor();
    constructor(block: GameAPI.Vector2i, normal: GameAPI.Vector2f, phase: number);
    constructor(block?: GameAPI.Vector2i, normal?: GameAPI.Vector2f, phase?: number) {
        if (block) {
            this._normal = normal;
            this.hit = true;
            this.phase = phase;
            this.blocks = [block];
        } else {
            this._normal = GameAPI.Vector2f.ZERO;
            this.hit = false;
            this.phase = 0;
            this.blocks = [];
        }
    }

    addNormal(normal: GameAPI.Vector2f) {
        this._normal = this._normal.add(normal);
    }

    getNormal(): GameAPI.Vector2f {
        if (this._normal.lengthSquared == 0) return GameAPI.Vector2f.ZERO;
        return this._normal.div(this._normal.length);
    }

    merge(other: CollisionResult) {
        this.hit = this.hit || other.hit;
        this.phase = Math.max(this.phase, other.phase);
        this.addNormal(other._normal);

        for (var i in other.blocks) {
            var block = other.blocks[i];
            if (!arrayContains(this.blocks, block)) {
                this.blocks.push(block);
            }
        }
    }
}

class BlockGrid extends GameEntity {
    private _grid: number[];
    private _tiles: GameAPI.BudgetBoy.Tilemap;

    private _blockImage: GameAPI.BudgetBoy.Image;
    private _blockSwatches: GameAPI.BudgetBoy.Swatch[];
    private _tileSize: GameAPI.Vector2f;

    constructor(cols: number, rows: number) {
        super();

        this._tiles = new GameAPI.BudgetBoy.Tilemap(new GameAPI.Vector2i(16, 8), new GameAPI.Vector2i(cols, rows));
        this._tileSize = new GameAPI.Vector2f(this._tiles.tileWidth, this._tiles.tileHeight);

        var gridSize = cols * rows;

        this._grid = [];
        for (var i = 0; i < gridSize; ++i) {
            this._grid.push(0);
        }
    }

    onLoadGraphics() {
        this._blockImage = graphics.getImage("block");

        if (!this._blockSwatches) {
            this._blockSwatches = [
                graphics.palette.findSwatch(0x0000FC, 0x0078F8, 0x3CBCFC),
                graphics.palette.findSwatch(0x940084, 0xD800CC, 0xF878F8),
                graphics.palette.findSwatch(0xA81000, 0xF83800, 0xF87858),
                graphics.palette.findSwatch(0x503000, 0xAC7C00, 0xF8B800),
                graphics.palette.findSwatch(0x007800, 0x00B800, 0xB8F818)
            ];
        }

        this.localBounds = new GameAPI.RectF(0, 0, this._tiles.width, this._tiles.height);
    }

    getPhases(): number {
        return this._blockSwatches.length;
    }

    getColumns(): number {
        return this._tiles.columns;
    }

    getRows(): number {
        return this._tiles.rows;
    }

    getPhase(col: number, row: number) {
        return this._grid[col + row * this.getColumns()];
    }

    setPhase(col: number, row: number, phase: number) {
        if (phase < 0 || phase > this.getPhases()) {
            return;
        }

        var index = col + row * this.getColumns();

        if (this._grid[index] == phase) {
            return;
        }

        this._grid[index] = phase;

        if (phase > 0) {
            this._tiles.setTile(col, row, this._blockImage, this._blockSwatches[phase - 1]);
        } else {
            this._tiles.clearTile(col, row);
        }
    }

    isColliding(pos: GameAPI.Vector2f, norm: GameAPI.Vector2f): CollisionResult {
        var block = pos.toVector2i();
        var hit = false;

        if (pos.x < 0 || pos.x >= this.getColumns() || pos.y < 0 || pos.y > this.getRows()) {
            return new CollisionResult();
        }

        var p = this.getPhase(Math.floor(pos.x), Math.floor(pos.y));

        return p > 0 ? new CollisionResult(block, norm, p) : new CollisionResult();
    }

    checkForCollision(ball: Ball): CollisionResult {
        var result = new CollisionResult();

        if (!ball.bounds.intersects(this.bounds)) {
            return result;
        }

        var bounds = ball.bounds.sub(this.position).divVec(this._tileSize);

        result.merge(this.isColliding(bounds.topLeft, new GameAPI.Vector2f(1, -1)));
        result.merge(this.isColliding(bounds.topRight, new GameAPI.Vector2f(-1, -1)));
        result.merge(this.isColliding(bounds.bottomLeft, new GameAPI.Vector2f(1, 1)));
        result.merge(this.isColliding(bounds.bottomRight, new GameAPI.Vector2f(-1, 1)));

        for (var i in result.blocks) {
            var block = result.blocks[i];
            this.setPhase(block.x, block.y, this.getPhase(block.x, block.y) - 1);
            this.getStage().onBlockHit();
        }

        return result;
    }

    onRender() {
        this._tiles.x = Math.floor(this.x);
        this._tiles.y = Math.floor(this.y);

        this._tiles.render(graphics);
    }
}
