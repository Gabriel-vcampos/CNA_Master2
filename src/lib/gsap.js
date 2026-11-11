import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrambleTextPlugin)
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }
