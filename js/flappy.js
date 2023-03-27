function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Pipe(reverse = false) {
    this.element = newElement('div', 'pipe')

    const border = newElement('div', 'border-pipe')
    const body = newElement('div', 'body-pipe')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function DoublePipe(height, opening, x) {
    this.element = newElement('div', 'pipes')

    this.top = new Pipe(true)
    this.bottom = new Pipe(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.shuffleOpening = () => {
        const heightTop = Math.random() * (height - opening)
        const heightBottom = height - opening - heightTop
        this.top.setHeight(heightTop)
        this.bottom.setHeight(heightBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.shuffleOpening()
    this.setX(x)
}

function Pipes(height, width, opening, space, notificatePoint) {
    this.evens = [
        new DoublePipe(height, opening , width),
        new DoublePipe(height, opening , width + space),
        new DoublePipe(height, opening , width + space * 2),
        new DoublePipe(height, opening , width + space * 3)
    ]

    const deslocate = 3
    this.animate = () => {
        this.evens.forEach(even => {
            even.setX(even.getX() - deslocate)

            // quando o elemento sair da area do jogo 
            if (even.getX() < -even.getWidth()) {
                even.setX(even.getX() + space * this.evens.length)
                even.shuffleOpening()
            }

            const middle = width / 2
            const crossedMiddle = even.getX() + deslocate >= middle && even.getX() < middle
            if(crossedMiddle) notificatePoint()
        })
    }
}

function Bird(heightGame) {
    let fly = false
    
    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0]) // com o split pega o valor depois do px para poder realizar calculos e etc a partir do indice 0
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeyup = e => fly = true
    window.onkeydown = e => fly = false

    this.animate = () => {
        const newY = this.getY() + (fly ? 8 : -5)
        const maxHeight = heightGame - this.element.clientHeight

        if(newY <= 0) { 
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heightGame / 2)
}

function Progress () {
    this.element = newElement('span', 'progress')
    this.updatePoint = point => {
        this.element.innerHTML = point
    }
    this.updatePoint(0)
}

function Overflow (elementA, elementB) {
    const a = elementA.getBoundingClientRect() // dimensoes dos retangulos 
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function Collides (bird, pipes) {
    let collides = false
    pipes.evens.forEach(DoublePipe => {
        if(!collides){
            const top = DoublePipe.top.element
            const bottom = DoublePipe.bottom.element
            collides = Overflow(bird.element, top) || Overflow(bird.element, bottom)
        }
    })
    return collides
}

function flappyBird() {
    let points = 0

    const areaGame = document.querySelector('[wm-flappy]')
    const height = areaGame.clientHeight
    const width = areaGame.clientWidth

    const progress = new Progress()
    const pipes = new Pipes(height, width, 200, 400, () => progress.updatePoint(++points))

    const bird = new Bird(height)

    areaGame.appendChild(progress.element)
    areaGame.appendChild(bird.element)
    pipes.evens.forEach(even => areaGame.appendChild(even.element))

    this.start = () => {
        // loop do jogo
        const time = setInterval(() => {
            pipes.animate()
            bird.animate()

            if(Collides(bird, pipes)){
                clearInterval(time)
            }
        }, 20)
    }
}

new flappyBird().start()