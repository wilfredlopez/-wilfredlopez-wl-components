import {
    Component, ComponentInterface, h, Prop,
    Host,
    Method,
    Watch, Event, EventEmitter,
} from "@stencil/core";
import { debounceEvent } from "../../utils/helpers";

export interface StarChangeEventDetail {
    totalRating: number
}

@Component({
    tag: "wl-star",
    styleUrl: "wl-star.scss",
    shadow: true,
})
export class WlStar implements ComponentInterface {
    @Prop({
        reflect: true,
    })
    showBorder?: boolean = false

    @Prop({
        reflect: true,
    })
    colorActive?: string = '#f90'


    /**
     * @size defaults to 80px
     */
    @Prop({
        reflect: true,
    })
    size?: string = "25px";


    @Prop({
        reflect: true,
        mutable: true,
    })
    totalRating: number = 0;


    @Method()
    async setTotalRating(number: number) {
        this.totalRating = number;
    }


    @Watch("totalRating")
    protected valueChanged(newValue: number, _oldValue: number) {
        this.totalRating = newValue
        this.wlChange.emit({
            totalRating: this.totalRating
        });
    }

    connectedCallback() {
        this.debounceChanged();
    }





    /**
 * Emitted when the value has changed.
 */
    @Event() wlChange!: EventEmitter<StarChangeEventDetail>;
    @Prop() debounce = 0;

    @Watch("debounce")
    protected debounceChanged() {
        this.wlChange = debounceEvent(this.wlChange, this.debounce);
    }

    render() {
        const activeStars = {
            1: this.totalRating >= 1,
            2: this.totalRating >= 2,
            3: this.totalRating >= 3,
            4: this.totalRating >= 4,
            5: this.totalRating >= 5,
        }
        return (
            <Host
                style={{
                    ["--size"]: `${this.size}`,
                    ["--colorActive"]: `${this.colorActive}`,
                }}
            >
                <div
                    class={{
                        "lds-roller": true,
                    }}
                    style={{
                        border: this.showBorder ? '1px solid #ccc' : ''
                    }}
                >

                    <label
                        class={activeStars[1] ? 'star active' : 'star'}

                        htmlFor="1-star" aria-label="1 Star" title="1 Star">&#9733;</label>
                    <input style={{
                        display: 'none'
                    }}

                        type="radio" id="1-star" name='rating' value="1"
                        onClick={() => this.setTotalRating(1)}
                        checked={activeStars[1]}
                    ></input>
                    <label htmlFor="2-stars"
                        class={activeStars[2] ? 'star active' : 'star'}
                        aria-label="2 Stars" title="2 Stars">&#9733;</label>
                    <input style={{
                        display: 'none'
                    }} type="radio" id="2-stars" name='rating' value="2"
                        onClick={() => this.setTotalRating(2)}
                        checked={activeStars[2]}
                    ></input>
                    <label
                        class={activeStars[3] ? 'star active' : 'star'}
                        htmlFor="3-stars" aria-label="3 Stars" title="3 Stars">&#9733;</label>
                    <input style={{
                        display: 'none'
                    }} type="radio" id="3-stars" name='rating' value="3"
                        onClick={() => this.setTotalRating(3)}
                        checked={activeStars[3]}
                    ></input>

                    <label htmlFor="4-stars"
                        class={activeStars[4] ? 'star active' : 'star'}
                        aria-label="4 Stars" title="4 Stars">&#9733;</label>
                    <input style={{
                        display: 'none'
                    }} type="radio" id="4-stars" name='rating' value="4"
                        onClick={() => this.setTotalRating(4)}
                        checked={activeStars[4]}
                    ></input>


                    <label htmlFor="5-stars"
                        class={activeStars[5] ? 'star active' : 'star'}
                        aria-label="5 Stars" title="5 Stars">&#9733;</label>
                    <input style={{
                        display: 'none'
                    }} type="radio" id="5-stars" name='rating' value="5"
                        onClick={() => this.setTotalRating(5)}
                        checked={activeStars[5]}
                    ></input>



                </div>
            </Host>
        );
    }
}
