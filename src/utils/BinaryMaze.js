export default class BinaryMaze {
  constructor(cols, rows) {
    this.rows;
    this.cols;
    this.cr;
    this.cc;
    this.tCells;
    this.cellData = [];
  }

  getRandom = value => {
    return ~~(Math.random() * value);
  };

  // gets position of cell based on x/y from array //
  getExpandex = (x, y) => {
    const index = this.cc + 1 + x * 2 + this.cc * 2 * y;
    return index;
  };

  generateMaze = (cols, rows) => {
    this.cellData = [];
    this.tCells = null;
    this.rows = rows;
    this.cols = cols;
    this.cr = 2 * rows + 1;
    this.cc = 2 * cols + 1;
    this.tCells = this.cr * this.cc;
    let str;
    // clear data set out //
    for (let d = 0; d < this.tCells; d += 1) {
      const x = d % this.cc;
      const y = (d - x) / this.cc;
      const oddCell = d & 1;
      const evenRow = y % 2;
      str = oddCell && evenRow ? 1 : oddCell ? 1 : evenRow ? 0 : 1;
      this.cellData[d] = str;
    }

    for (let r = 0; r < this.rows; r++) {
      for (let x = 0; x < this.cols; x++) {
        const y = this.rows - r - 1;
        // test cases //
        const canGoUp = y > 0;
        const canGoLeft = x < this.cols - 1;
        const coinFlip = this.getRandom(100) > 50;
        // get data cell based on array //
        const expandex = this.getExpandex(x, y);

        if ((canGoUp && !canGoLeft) || (canGoUp && coinFlip)) {
          this.cellData[expandex - this.cc] = 0;
        }
        if ((!canGoUp && canGoLeft) || (canGoLeft && !coinFlip)) {
          this.cellData[expandex + 1] = 0;
        }
      }
    }

    return this.cellData;
  };
}
