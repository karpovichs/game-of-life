import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Box extends React.Component {
    selectBox = () => {
        this.props.selectBox(this.props.row, this.props.col)
    }

    render() {
        return (
            <div
                className={this.props.boxClass}
                id={this.props.id}
                onClick={this.selectBox}
                data-alive={this.props.cycle}
            />
        )
    }
}

class Buttons extends React.Component {
    render() {
        return (
            <div className='buttons'>
                <div>
                    <button className="btn" onClick={this.props.playButton}>Play</button>
                    <button className="btn" onClick={this.props.pauseButton}>Pause</button>
                </div>
                <div>
                    <button className="btn" onClick={this.props.seed}>Seed</button>
                    <button className="btn" onClick={this.props.clear}>Clear</button>
                </div>
                <div>
                    <button className="btn" onClick={this.props.slow}>Slow</button>
                    <button className="btn" onClick={this.props.fast}>Fast</button>
                </div>
                <p>
                    <span>Die min condition</span>
                    <input placeholder="2" onInput={this.props.changeDieMin}/>
                </p>
                <p>
                    <span>Die max condition</span>
                    <input placeholder="3" onInput={this.props.changeDieMax}/>
                </p>
                <p>
                    <span>Alive condition</span>
                    <input placeholder="3" onInput={this.props.changeAlive}/>
                </p>
            </div>
        )
    }
}

class Grid extends React.Component {
    render() {
        const width = this.props.cols * 9;
        let rowsArray = [];
        let boxClass = "";

        for (let i = 0; i < this.props.rows; i++) {
            for (let j = 0; j < this.props.rows; j++) {
                let boxId = i + "_" + j;
                let boxCycle = this.props.generationCycle[i][j];
                boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
                rowsArray.push(
                    <Box
                        boxClass={boxClass}
                        key={boxId}
                        boxId={boxId}
                        row={i}
                        col={j}
                        selectBox={this.props.selectBox}
                        cycle={boxCycle}
                    />
                )
            }
        }

        return(
            <div className="grid" style={{width: width}}>
                {rowsArray}
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.speed = 100;
        this.rows = 60;
        this.cols = 60;
        this.state = {
            generation: 0,
            gridFull: Array(this.rows).fill(Array(this.cols).fill(false)),
            generationCycle: Array(this.rows).fill(Array(this.cols).fill(0)),
            dieMin: 2,
            dieMax: 3,
            alive: 2,
        }
    }

    selectBox = (row, col) => {
        let gridCopy = arrayClone(this.state.gridFull);
        let cycleCopy = arrayClone(this.state.generationCycle);
        gridCopy[row][col] = !gridCopy[row][col];
        cycleCopy[row][col] === 0 ? cycleCopy[row][col] = 1 : cycleCopy[row][col] = 0;
        this.setState({
            gridFull: gridCopy,
            generationCycle: cycleCopy,
        })
    }

    playButton = () => {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(this.play, this.speed);
    }

    pauseButton = () => {
        clearInterval(this.intervalId);
    }

    changeDieMin = (evt) => {
        this.setState({
            dieMin: evt.target.value,
        })
    }

    changeDieMax = (evt) => {
        this.setState({
            dieMax: evt.target.value,
        })
    }

    changeAlive = (evt) => {
        this.setState({
            alive: evt.target.value,
        })
    }

    slow = () => {
        this.speed = 1000;
        this.playButton();
    }

    fast = () => {
        this.speed = 100;
        this.playButton();
    }

    clear = () => {
        this.pauseButton();
        let grid = Array(this.rows).fill(Array(this.cols).fill(false));
        let cycleClone = Array(this.rows).fill(Array(this.cols).fill(0));
        this.setState({
            gridFull: grid,
            generation: 0,
            generationCycle: cycleClone,
        })
    }

    seed = () => {
        this.clear();
        let gridCopy = arrayClone(this.state.gridFull);
        let cycleClone = arrayClone(this.state.generationCycle);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.rows; j++) {
                let randomNumber = Math.floor(Math.random() * 4);
                randomNumber === 1 ? gridCopy[i][j] = true : gridCopy[i][j] = false;
                randomNumber === 1 ? cycleClone[i][j] = 1 : cycleClone[i][j] = 0;
            }
        }

        this.setState({
            gridFull: gridCopy,
            generationCycle: cycleClone,
        })
    }

    play = () => {
        let grid = this.state.gridFull;
        let gridClone = arrayClone(this.state.gridFull);
        let cycleClone = arrayClone(this.state.generationCycle);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let count = 0;
                if (i > 0) if (grid[i - 1]) count++;
                if (i > 0 && j > 0) if (grid[i - 1][j-1]) count++;
                if (i > 0 && j < this.cols - 1) if (grid[i - 1][j + 1]) count++;
                if (j < this.cols - 1) if (grid[i][j+1]) count++;
                if (j > 0) if (grid[i][j-1]) count++;
                if (i < this.rows - 1) if (grid[i+1][j]) count++;
                if (i < this.rows - 1 && j > 0) if (grid[i+1][j-1]) count++;
                if (i < this.rows - 1 && this.cols - 1) if (grid[i+1][j+1]) count++;
                if (grid[i][j] && (count < this.state.dieMin || count > this.state.dieMax)) {
                    gridClone[i][j] = false;
                }
                if (!grid[i][j] && count === this.state.alive) {
                    gridClone[i][j] = true;
                    cycleClone[i][j]++
                }
            }
        }

        this.setState({
            gridFull: gridClone,
            generation: this.state.generation + 1,
            generationCycle: cycleClone,
        })
    }

    componentDidMount() {
        this.seed();
    }

    render() {
        return (
            <div className='col-wrapper'>
                <div className="col">
                    <h1>The Game of Life</h1>
                    <Buttons
                        playButton={this.playButton}
                        pauseButton={this.pauseButton}
                        slow={this.slow}
                        fast={this.fast}
                        clear={this.clear}
                        seed={this.seed}
                        gridSize={this.gridSize}
                        changeDieMin={this.changeDieMin}
                        changeDieMax={this.changeDieMax}
                        changeAlive={this.changeAlive}
                    />
                    <h2>Generations: {this.state.generation}</h2>
                </div>

                <div className="col">
                    <Grid
                        gridFull = {this.state.gridFull}
                        rows = {this.rows}
                        cols = {this.cols}
                        selectBox = {this.selectBox}
                        generationCycle = {this.state.generationCycle}
                    />
                </div>
            </div>
        )
    }
}

function arrayClone(arr) {
    return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<App />, document.getElementById('root'));
