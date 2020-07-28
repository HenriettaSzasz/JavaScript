class Timer {
    constructor(main = document.body) {
        this.maxTime = 5
        this.minTime = 0
        
        let div = document.createElement('div')

        div.classList.add('counter')

        let par = document.createElement('p')

        let counter = main.appendChild(div)

        counter.appendChild(par)

        this.node = main.appendChild(counter)
    }

    startTimer(table) {
        let i = this.maxTime
        this.timer = setInterval(() => {
            this.node.getElementsByTagName('p')[0].innerHTML = i--;
            if (i < this.minTime) {
                this.stopTimer()
                table.style.display = 'block'
                this.node.style.display = 'none'
            }
        }, 1000)
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    setMaxTime(time){
        this.maxTime = time
    }
    setMinTime(time){
        this.minTime = time
    }
}

class Table {
    constructor(main = document.body) {
        let div = document.createElement('div')

        this.node = main.appendChild(div)

        this.node.style.display = 'none'

        this.createSquares()
    }

    createSquares() {
        this.table = []
        for (let i = 0; i < 8; i++) {

            this.table[i] = [];

            let div = document.createElement('div')

            div.classList.add('row')

            let row = this.node.appendChild(div)

            for (let j = 0; j < 8; j++) {
                div = document.createElement('div')

                if ((i + j) % 2 == 0) {
                    div.classList.add('black')
                }
                else {
                    div.classList.add('white')
                }

                div.classList.add('square')

                let square = row.appendChild(div)

                if (j < 2 || j > 5) {
                    let p = new Piece(square)

                    this.table[i][j] = p
                }
            }
        }
    }
}

class Piece {
    constructor(square = document.body) {
        let div = document.createElement('div')

        div.classList.add('piece')

        this.node = square.appendChild(div)
    }
}

class App {
    constructor(){
        let div = document.createElement('div')

        div.classList.add('main')

        this.main = document.body.appendChild(div)
    }
    startApp() {
        let table = new Table(this.main)

        let timer = new Timer(this.main)

        timer.setMaxTime(3)

        timer.startTimer(table.node)
    }
}

application = new App()

application.startApp()

