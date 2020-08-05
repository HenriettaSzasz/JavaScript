class Timer {
    constructor($main = $('body')) { // the paramater is the parent node, if missing - the parent is body
        this.maxTime = 5

        this.$node = $('<div>').addClass('counter').appendTo($main)

        $('<p>').appendTo(this.$node)
    }

    startTimer($table) {    // the parameter is the node to trigger event on after the timer stops
        let i = this.maxTime
        this.timer = setInterval(() => {        // sets and interval at every second        
            this.$node.find('p').text(i--)
            if (i < 0) {
                this.stopTimer()
                this.$node.css('display', 'none') // hide counter
                $table.trigger('timesUp')     // trigger event on table
            }
        }, 1000)
    }
    stopTimer() {               // stop the timer
        clearInterval(this.timer);
    }
    setMaxTime(time) {      // counter start
        this.maxTime = time
    }
}

class Table {
    constructor($main = $('body'), backup) {
        const $table = $('<div>').addClass('table').appendTo($main)

        this.$node = $('<div>').attr('id', 'tableContainer').appendTo($table)       // container for draggable

        this.$node.on('timesUp', () => {    // event - when counter stops
            this.createPieces()
            this.createBoard($main)     // player's scores

            if (backup.length > 0)
                this.doBackup(backup)   // localStorage backup

            this.$node.css('display', 'inline-block')   // show table
            this.$board.css('display', 'flex')          // show board
        })

        this.$node.css('display', 'none')   // hide until counter stops

        this.createSquares()

        this.backup = backup    // copy backup

        this.round = 'white'    //  white always moves first

        this.kingsPosition = { 'white': [4, 0], 'black': [4, 7] }   // kings's position

        this.$lastSelected = null   // the piece to be moved
    }

    select(event) {
        const i = event.currentTarget.getAttribute('data-i')    //event -  click / drag starts / dropped
        const j = event.currentTarget.getAttribute('data-j')

        const selectedPiece = this.piece[i][j]      // selected piece
        const $selectedSquare = this.table[i][j]    // selected square

        let isLegalMove = false
        let isYourPiece = false

        if (selectedPiece != null && selectedPiece.color == this.round) {   // if the selected square has a piece and the piece color is the same as the current player's
            isYourPiece = true
        }

        if ($selectedSquare.children().first().hasClass('highlighted') || $selectedSquare.hasClass('highlighted')) {    // if the selected square is already highlighted (yellow or red)
            isLegalMove = true
        }

        this.removeHighlights() // remove the highlights from squares (legal move already known)

        if (this.$lastSelected != null && isLegalMove == true) {    // if second click or drop and legalmove
            this.$lastSelected = null
            if (this.piece[this.lastI][this.lastJ] instanceof King) { // if the King moves, change its position
                this.kingsPosition[this.round] = [i, j]
            }
            let currentPiece = null                  // copy of the piece to be taken
            if (this.piece[i][j] != null)
                currentPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[i][j])), this.piece[i][j])  // only way to copy an instance of a custom object completely (functions too)

            let lastPiece = null                            //  copy of the piece to move
            if (this.piece[this.lastI][this.lastJ] != null)
                lastPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[this.lastI][this.lastJ])), this.piece[this.lastI][this.lastJ])

            this.piece[i][j] = lastPiece                // make a "fake" move to check if the king is still threatened
            this.piece[this.lastI][this.lastJ] = null

            if (this.check() == false) {                      // if the move is safe (the king is not threatened)

                this.movePiece(this.lastI, this.lastJ, i, j)    // move the piece on table

                if (this.checkMate()) {                              // check if opponent has any possible moves
                    this[this.round == 'white' ? 'firstPlayer' : 'secondPlayer'].won()
                    this.changePlayer()
                }
                else if (currentPiece != null) {                        // a piece was taken
                    this[this.round == 'white' ? 'firstPlayer' : 'secondPlayer'].addScore(currentPiece.getPoints())
                }

                if (lastPiece.firstMove == true) {     // if the Pawn moves for the first time, he can make two steps
                    lastPiece.firstMove = false
                }

                this.backup[0] = [this.round == 'white' ? 'black' : 'white', this.firstPlayer.score, this.secondPlayer.score]   // first element of backup is the next round, and the scores

                this.backup.push([this.lastI, this.lastJ, i, j, currentPiece == null ? null : currentPiece.color, currentPiece == null ? null : currentPiece.constructor.name]) //  push the current move 

                if (lastPiece instanceof Pawn && this.promotion(j)) {           // the pawn reached the end of the table
                    this.table[i][j].children().first().remove()
                    this.piece[i][j] = new Queen(this.table[i][j], this.round)      // gets promoted to Queen

                    this.backup.push([i, j, i, j, lastPiece == null ? null : lastPiece.color, lastPiece == null ? null : lastPiece.constructor.name])   // push move to same position, just to replace the pawn
                }

                localStorage.setItem('savedMoves', JSON.stringify(this.backup)) // save the current player's round, the scores and the moves taken so far

                $('.undo').attr('disabled', false)  // enable the undo button

                this.changePlayer()                 // switch players
            }
            else {                 // if the move is not safe, undo the "fake" move
                if (lastPiece instanceof King) {
                    this.kingsPosition[this.round] = [this.lastI, this.lastJ]
                }

                this.piece[i][j] = currentPiece
                this.piece[this.lastI][this.lastJ] = lastPiece
            }
        }
        else if (isYourPiece == true) {   //    clicks on a piece that is your color, select it

            this.$lastSelected = this.piece[i][j].$node

            this.lastI = i
            this.lastJ = j

            this.table[i][j].children().first().addClass('selected').css('backgroundColor', 'yellow')

            let moveTo = this.piece[i][j].canMove(+i, +j, this.piece, this.round)       // checks possible moves

            this.highlightMove(moveTo)          // highlight possible moves
        }
        else {
            this.$lastSelected = null
        }
    }

    checkMate() {
        let oponent = this.round == 'white' ? 'black' : 'white'

        this.round = oponent

        let isCheckMate = true

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.piece[i][j] != null && this.piece[i][j].$node.hasClass(oponent)) {
                    let moves = this.piece[i][j].canMove(i, j, this.piece, oponent)

                    moves.forEach(el => {

                        let currentPiece = null
                        let lastPiece = null

                        if (this.piece[i][j] != null)
                            lastPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[i][j])), this.piece[i][j])

                        if (this.piece[el[0]][el[1]] != null)
                            currentPiece = Object.assign(Object.create(Object.getPrototypeOf(this.piece[el[0]][el[1]])), this.piece[el[0]][el[1]])

                        this.piece[i][j] = null
                        this.piece[el[0]][el[1]] = lastPiece

                        if (lastPiece instanceof King) {
                            this.kingsPosition[this.round] = [el[0], el[1]]
                        }

                        if (this.check() == false) {
                            isCheckMate = false
                        }

                        if (lastPiece instanceof King) {
                            this.kingsPosition[this.round] = [i, j]
                        }

                        this.piece[i][j] = lastPiece
                        this.piece[el[0]][el[1]] = currentPiece
                    })
                }
            }
        }

        oponent == 'white' ? this.round = 'black' : this.round = 'white'

        return isCheckMate
    }

    check() {
        let oponent = ''
        this.round == 'white' ? oponent = 'black' : oponent = 'white'
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let element = this.piece[i][j]
                if (element != null && element.$node.hasClass(oponent)) {
                    let moves = element.canMove(i, j, this.piece, oponent)
                    let check = false
                    moves.forEach(el => {
                        if (el[0] == this.kingsPosition[this.round][0] && el[1] == this.kingsPosition[this.round][1]) {
                            check = true
                        }
                    })
                    if (check) {
                        return true
                    }
                }
            }
        }
        return false
    }

    promotion(column) {
        if (this.round == 'white' && column == 7 || this.round == 'black' && column == 0)
            return true
        return false
    }

    movePiece(fromI, fromJ, toI, toJ) {
        this.table[toI][toJ].children().first().remove()

        this.table[fromI][fromJ].children().first().appendTo(this.table[toI][toJ])

        game.post(fromI, fromJ, toI, toJ)
    }

    highlightMove(positions) {
        positions.forEach(element => {
            let i = element[0]
            let j = element[1]
            if (this.table[i][j].children('.piece').length == 0) {
                $('<div>').addClass('highlighted square').css('backgroundColor', 'rgba(255, 255, 0, 0.5)').appendTo(this.table[i][j])
            }
            else if (this.piece[i][j].color != this.round) {
                this.table[i][j].addClass('highlighted red').css('backgroundColor', 'rgba(255, 0, 0, 0.5)')
            }
            this.table[i][j].droppable('enable')
        });
    }

    removeHighlights() {
        $('.selected').css('backgroundColor', 'transparent').removeClass('selected')

        $('.highlighted.red.white').css('backgroundColor', 'whitesmoke')

        $('.highlighted.red.black').css('backgroundColor', 'gray')

        $('.highlighted.red').removeClass('highlighted red')

        $('.highlighted').remove()
    }

    createSquares() {
        this.table = []
        this.piece = []
        for (let i = 0; i < 8; i++) {

            this.table[i] = []
            this.piece[i] = []

            const $row = $('<div>').addClass('row').appendTo(this.$node)

            for (let j = 0; j < 8; j++) {
                let squareColor = ''
                if ((i + j) % 2 == 0) {
                    squareColor = 'black'
                }
                else {
                    squareColor = 'white'
                }

                const $square = $('<div>').addClass('square ' + squareColor).attr('data-i', i).attr('data-j', j).appendTo($row)

                $square.on('dragstart drop click', (event) => {
                    this.select(event)
                })

                $square.droppable({
                    accept: '#draggable'
                })

                $square.droppable('disable')

                this.table[i][j] = $square

                this.piece[i][j] = null
            }
        }
    }

    createPieces() {
        let color = 'white'
        let column = 0
        let column2 = 1
        let i = 2

        while (i > 0) {
            this.piece[0][column] = new Rook(this.table[0][column], color)
            this.piece[1][column] = new Knight(this.table[1][column], color)
            this.piece[2][column] = new Bishop(this.table[2][column], color)
            this.piece[3][column] = new Queen(this.table[3][column], color)
            this.piece[4][column] = new King(this.table[4][column], color)
            this.piece[5][column] = new Bishop(this.table[5][column], color)
            this.piece[6][column] = new Knight(this.table[6][column], color)
            this.piece[7][column] = new Rook(this.table[7][column], color)

            for (let j = 0; j < 8; j++) {
                this.piece[j][column2] = new Pawn(this.table[j][column2], color)
            }

            color = 'black'
            column = 7
            column2 = 6
            i--
        }
    }

    createBoard($main = $('body')) {
        this.$board = $('<div>').addClass('board').css('display', 'node').appendTo($main)

        this.firstPlayer = new Player(this.$board, 'firstPlayer', 'white')
        this.secondPlayer = new Player(this.$board, 'secondPlayer', 'black')

        this.firstPlayer.$node.css('transform', 'scale(1.2)')
        this.secondPlayer.$node.css('transform', 'scale(0.9)')
    }

    changePlayer() {
        $('.' + this.round + '.piece').children('.image').draggable('disable')
        if (this.round == 'white') {
            this.round = 'black'
            this.firstPlayer.$node.css('transform', 'scale(0.8)')
            this.secondPlayer.$node.css('transform', 'scale(1.2)')
        }
        else {
            this.round = 'white'
            this.secondPlayer.$node.css('transform', 'scale(0.9)')
            this.firstPlayer.$node.css('transform', 'scale(1.2)')
        }
        $('.' + this.round + '.piece').children('.image').draggable('enable')
    }

    doBackup(moves) {
        moves.forEach((element, index) => {
            if (index == 0) {
                this.round = element[0]
                this.firstPlayer.addScore(element[1])
                this.secondPlayer.addScore(element[2])

                if (this.round == 'black') {
                    this.round = 'white'
                    this.changePlayer()
                }
            }
            else {
                let fromI = element[0]
                let fromJ = element[1]
                let toI = element[2]
                let toJ = element[3]

                const color = element[4]
                const type = element[5]

                this.movePiece(fromI, fromJ, toI, toJ)
                this.piece[toI][toJ] = this.piece[fromI][fromJ]
                this.piece[fromI][fromJ] = null

                if (this.piece[toI][toJ] instanceof King) {
                    this.kingsPosition[this.piece[toI][toJ].color] = [toI, toJ]
                }

                if (color != null && fromI == toI && fromJ == toJ) {
                    this.newPiece(toI, toJ, color, 'Queen')
                }

                if (this.piece[toI][toJ] instanceof Pawn) {
                    if (toJ == 1 || toJ == 6)
                        this.piece[toI][toJ].firstMove = true
                    else
                        this.piece[toI][toJ].firstMove = false
                }
            }

        })
        if (this.backup.length > 1)
            $('.undo').attr('disabled', false)
    }

    undo() {
        let repeat = false

        this.removeHighlights()

        const fromI = this.backup[this.backup.length - 1][2]
        const fromJ = this.backup[this.backup.length - 1][3]
        const toI = this.backup[this.backup.length - 1][0]
        const toJ = this.backup[this.backup.length - 1][1]

        const color = this.backup[this.backup.length - 1][4]
        const type = this.backup[this.backup.length - 1][5]

        this.table[fromI][fromJ].children().first().appendTo(this.table[toI][toJ])

        this.piece[toI][toJ] = this.piece[fromI][fromJ]
        this.piece[fromI][fromJ] = null

        if (this.piece[toI][toJ] instanceof King) {
            this.kingsPosition[this.piece[toI][toJ].color] = [toI, toJ]
        }

        if (this.table[fromI][fromJ].children().length > 0) {
            repeat = true
        }

        if (color != null) {
            this.newPiece(fromI, fromJ, color, type)

            if (repeat == false)
                this[this.piece[fromI][fromJ].color == 'black' ? 'firstPlayer' : 'secondPlayer'].addScore(-(this.piece[fromI][fromJ].getPoints()))
        }

        if ((toJ == 1 || toJ == 6) && this.piece[toI][toJ] instanceof Pawn) {
            this.piece[toI][toJ].firstMove = true
        }

        this.changePlayer()

        this.backup.pop()

        this.backup[0] = [this.round, this.firstPlayer.score, this.secondPlayer.score]

        localStorage.setItem('savedMoves', JSON.stringify(this.backup))

        if (this.backup.length == 1) {
            $('.undo').attr('disabled', true)
        }

        if (repeat) {
            this.undo()
            this.changePlayer()
        }
    }

    newPiece(i, j, color, type) {
        this.table[i][j].children().first().remove()

        switch (type) {
            case 'King':
                this.piece[i][j] = new King(this.table[i][j], color)
                break;
            case 'Queen':
                this.piece[i][j] = new Queen(this.table[i][j], color)
                break;
            case 'Bishop':
                this.piece[i][j] = new Bishop(this.table[i][j], color)
                break;
            case 'Knight':
                this.piece[i][j] = new Knight(this.table[i][j], color)
                break;
            case 'Rook':
                this.piece[i][j] = new Rook(this.table[i][j], color)
                break;
            case 'Pawn':
                this.piece[i][j] = new Pawn(this.table[i][j], color)
                break;
            default:
                break;
        }
    }
}

class Piece {
    constructor($square = $('body'), color) {
        let className = this.constructor.name.toLowerCase()

        this.$node = $('<div>').addClass(color + ' piece ' + className).appendTo($square)

        this.color = color

        const $img = $('<img>').addClass('image').attr('src', 'https://github.com/HenriettaSzasz/JavaScript/blob/master/Chess%20Game/images/' + color + '_' + className + '.png' + '?raw=true').attr('alt', color + ' ' + className).appendTo(this.$node)

        $img.attr('id', 'draggable').draggable({
            containment: '#tableContainer',
            revert: true,
            revertDuration: 0,
            zIndex: 1,
            snap: '.square'
        })

        if (color == 'black') {
            $img.draggable('disable')
        }
        else {
            $img.draggable('enable')
        }
    }

    moveDiag(i, j, pieces, round) {
        let moves = []
        for (let l = i + 1, k = j + 1; l < 8 && k < 8; l++, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i - 1, k = j + 1; l >= 0 && k < 8; l--, k++) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i - 1, k = j - 1; l >= 0 && k >= 0; l--, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let l = i + 1, k = j - 1; l < 8 && k >= 0; l++, k--) {
            moves.push([l, k])
            if (pieces[l][k] != null) {
                if (pieces[l][k].color == round)
                    moves.pop()
                break
            }
        }
        return moves
    }

    moveLine(i, j, pieces, round) {
        let moves = []
        for (let k = j + 1; k < 8; k++) {
            moves.push([i, k])
            if (pieces[i][k] != null) {
                if (pieces[i][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = i + 1; k < 8; k++) {
            moves.push([k, j])
            if (pieces[k][j] != null) {
                if (pieces[k][j].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = j - 1; k >= 0; k--) {
            moves.push([i, k])
            if (pieces[i][k] != null) {
                if (pieces[i][k].color == round)
                    moves.pop()
                break
            }
        }
        for (let k = i - 1; k >= 0; k--) {
            moves.push([k, j])
            if (pieces[k][j] != null) {
                if (pieces[k][j].color == round)
                    moves.pop()
                break
            }
        }
        return moves
    }
}

class Queen extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveDiag(i, j, pieces, round).concat(this.moveLine(i, j, pieces, round))
    }
    getPoints() {
        return 9
    }
}

class King extends Piece {
    canMove(i, j, pieces, round) {
        let moves = []
        if (j < 7) {
            if (pieces[i][j + 1] == null || (pieces[i][j + 1] != null && pieces[i][j + 1].color != round))
                moves.push([i, j + 1])
        }
        if (j > 0) {
            if (pieces[i][j - 1] == null || (pieces[i][j - 1] != null && pieces[i][j - 1].color != round))
                moves.push([i, j - 1])
        }
        if (i < 7) {
            if (pieces[i + 1][j] == null || (pieces[i + 1][j] != null && pieces[i + 1][j].color != round))
                moves.push([i + 1, j])
        }
        if (i > 0) {
            if (pieces[i - 1][j] == null || (pieces[i - 1][j] != null && pieces[i - 1][j].color != round))
                moves.push([i - 1, j])
        }
        if (j < 7 && i < 7) {
            if (pieces[i + 1][j + 1] == null || (pieces[i + 1][j + 1] != null && pieces[i + 1][j + 1].color != round))
                moves.push([i + 1, j + 1])
        }
        if (j > 0 && i > 0) {
            if (pieces[i - 1][j - 1] == null || (pieces[i - 1][j - 1] != null && pieces[i - 1][j - 1].color != round))
                moves.push([i - 1, j - 1])
        }
        if (i < 7 && j > 0) {
            if (pieces[i + 1][j - 1] == null || (pieces[i + 1][j - 1] != null && pieces[i + 1][j - 1].color != round))
                moves.push([i + 1, j - 1])
        }
        if (i > 0 && j < 7) {
            if (pieces[i - 1][j + 1] == null || (pieces[i - 1][j + 1] != null && pieces[i - 1][j + 1].color != round))
                moves.push([i - 1, j + 1])
        }
        return moves
    }
}

class Bishop extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveDiag(i, j, pieces)
    }
    getPoints() {
        return 3
    }
}

class Knight extends Piece {
    canMove(i, j, pieces, round) {
        let moves = []
        if (i < 7 && j < 6 && (pieces[i + 1][j + 2] == null || (pieces[i + 1][j + 2] != null && pieces[i + 1][j + 2].color != round))) {
            moves.push([i + 1, j + 2])
        }
        if (i > 0 && j < 6 && (pieces[i - 1][j + 2] == null || (pieces[i - 1][j + 2] != null && pieces[i - 1][j + 2].color != round))) {
            moves.push([i - 1, j + 2])
        }
        if (i < 7 && j > 1 && (pieces[i + 1][j - 2] == null || (pieces[i + 1][j - 2] != null && pieces[i + 1][j - 2].color != round))) {
            moves.push([i + 1, j - 2])
        }
        if (i > 0 && j > 1 && (pieces[i - 1][j - 2] == null || (pieces[i - 1][j - 2] != null && pieces[i - 1][j - 2].color != round))) {
            moves.push([i - 1, j - 2])
        }
        if (j < 7 && i < 6 && (pieces[i + 2][j + 1] == null || (pieces[i + 2][j + 1] != null && pieces[i + 2][j + 1].color != round))) {
            moves.push([i + 2, j + 1])
        }
        if (j > 0 && i < 6 && (pieces[i + 2][j - 1] == null || (pieces[i + 2][j - 1] != null && pieces[i + 2][j - 1].color != round))) {
            moves.push([i + 2, j - 1])
        }
        if (j < 7 && i > 1 && (pieces[i - 2][j + 1] == null || (pieces[i - 2][j + 1] != null && pieces[i - 2][j + 1].color != round))) {
            moves.push([i - 2, j + 1])
        }
        if (j > 0 && i > 1 && (pieces[i - 2][j - 1] == null || (pieces[i - 2][j - 1] != null && pieces[i - 2][j - 1].color != round))) {
            moves.push([i - 2, j - 1])
        }
        return moves
    }
    getPoints() {
        return 3
    }
}

class Rook extends Piece {
    canMove(i, j, pieces, round) {
        return this.moveLine(i, j, pieces, round)
    }
    getPoints() {
        return 5
    }
}

class Pawn extends Piece {
    constructor($square = $('body'), color) {
        super($square, color)
        this.firstMove = true
    }
    canMove(i, j, pieces, round) {
        let moves = []
        if (j < 7 && pieces[i][j + 1] == null && round == 'white') {
            moves.push([i, j + 1])
        }
        if (j > 0 && pieces[i][j - 1] == null && round == 'black') {
            moves.push([i, j - 1])
        }
        if (j < 7 && i < 7 && pieces[i + 1][j + 1] != null && round == 'white') {
            moves.push([i + 1, j + 1])
        }
        if (j > 0 && i < 7 && pieces[i + 1][j - 1] != null && round == 'black') {
            moves.push([i + 1, j - 1])
        }
        if (j < 7 && i > 0 && pieces[i - 1][j + 1] != null && round == 'white') {
            moves.push([i - 1, j + 1])
        }
        if (j > 0 && i > 0 && pieces[i - 1][j - 1] != null && round == 'black') {
            moves.push([i - 1, j - 1])
        }
        if (this.firstMove) {
            if (j < 6 && pieces[i][j + 2] == null && pieces[i][j + 1] == null && round == 'white') {
                moves.push([i, j + 2])
            }
            if (j > 1 && pieces[i][j - 2] == null && pieces[i][j - 1] == null && round == 'black') {
                moves.push([i, j - 2])
            }
        }
        return moves
    }
    getPoints() {
        return 1
    }
}

class Player {
    constructor($board = $('body'), name, color) {
        this.score = 0

        this.$node = $('<button>').addClass('player ' + color).text(this.score).appendTo($board)
    }

    addScore(points) {
        this.score += points
        this.$node.text(this.score)
    }

    won() {
        this.$node.text('WINNER')
        setTimeout(() => {
            $('.main').trigger('endGame')
        })
    }
}

class Game {
    constructor() {
        this.$main = $('<div>').addClass('main').appendTo($('body'))

        this.$main.click(() => {
            $('.joke').remove()
        })

        this.$main.on('endGame', () => {
            if (confirm('Restart game?')) {
                this.restartGame()
            }
        })

        this.createMenu()

        this.startGame()

        this.ID = localStorage.getItem('gameID') // jocul 7!!

        if (this.ID === null) {
            $.ajax({
                method: 'POST',
                url: 'https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game',
                data: {
                    name: 'new game'
                }
            }).done((data) => {
                localStorage.setItem('gameID', data.ID)
            })
        }

        //setInterval(this.get.bind(this), 1000)
    }

    get() {
        $.ajax({
            url: 'https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game/' + this.ID
        }).done((data) => {
            console.log(data.moves)
        })

    }

    post(fromI, fromJ, toI, toJ) {
        $.ajax({
            method : 'POST',
            url: 'https://chess.thrive-dev.bitstoneint.com/wp-json/chess-api/game/' + this.ID,
            data : {
                move : {from : {x : fromJ, y : fromI}, to : {x : toJ, y : toI}, piece : {color, type}}
            }
        }).done((data) => {
            console.log(data)
        })
    }

    startGame() {
        let backup = []
        let item = null
        item = localStorage.getItem('savedMoves')

        if (item !== null) {
            if (confirm('Reload game?')) {
                backup = JSON.parse(item)
            }
            else {
                localStorage.removeItem('savedMoves')
            }
        }

        this.table = new Table(this.$main, backup)

        this.timer = new Timer(this.$main)

        this.timer.setMaxTime(0)

        this.timer.startTimer(this.table.$node)
    }

    restartGame() {
        this.table.$board.remove()
        this.table.$node.remove()
        this.table = new Table(this.$main, [])
        this.timer.startTimer(this.table.$node)
    }

    createMenu() {
        const $menu = $('<div>').addClass('menu').appendTo(this.$main)

        const $random = $('<button>').addClass('button').text('Get a random joke').appendTo($menu)

        $random.click(() => {
            $.ajax({
                url: ' https://sv443.net/jokeapi/v2/joke/any',
                data: {
                    blacklistFlags: 'nsfw'
                },
                error: () => {
                    $('<button>').addClass('button joke').appendTo(this.$main).html('noJokesFoundException: you.')
                }
            }).done((data) => {
                const $joke = $('<button>').addClass('button joke').appendTo(this.$main)
                if (data.error == true)
                    $joke.text(data.message)
                else if (data.joke !== undefined)
                    $joke.text(data.joke)
                else
                    $joke.html(data.setup + '<br />' + data.delivery)
            })
        })

        const $restart = $('<button>').addClass('button').text('Restart game').appendTo($menu)

        $restart.click(() => {
            if (confirm('Are U sure?'))
                this.restartGame()
        })

        const $undo = $('<button>').addClass('button undo').text('Undo last move').attr('disabled', true).appendTo($menu)

        $undo.click(() => {
            this.table.undo()
        })
    }
}

window.game = new Game()
