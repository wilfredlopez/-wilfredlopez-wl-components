import { Component, ComponentInterface, h, Prop, Host } from "@stencil/core";
import { createColorClasses } from "../../utils/utils";
import { Color } from "../../interfaces/Color.model";

@Component({
    tag: "wl-tooltip",
    styleUrl: "wl-tooltip.scss",
    shadow: true,
})
export class WlTooltip implements ComponentInterface {
    @Prop({
        reflectToAttr: true,
    })
    color?: Color = "light";

    @Prop({
        reflectToAttr: true,
    })
    message!: string

    @Prop({
        reflectToAttr: true,
    })
    contentWidth: string = '300px'

    @Prop({
        reflectToAttr: true,
    })
    iconWidth: string = '1.4rem'


    render() {
        return (
            <Host
                style={{
                    ["--contentWidth"]: `${this.contentWidth}`,
                    ["--iconWidth"]: `${this.iconWidth}`,
                }}
                class={{
                    ...createColorClasses(this.color),
                }}
            >


                <svg
                    id="cancel"
                    viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8"
                        fill="var(--wl-color-base, #1F9BF5)"
                    />
                    <rect x="5.12854" y="4" width="9.57563" height="1.59594" transform="rotate(45 5.12854 4)" fill="white" />
                    <rect x="4" y="10.771" width="9.57563" height="1.59594" transform="rotate(-45 4 10.771)" fill="white" />
                </svg>
                <svg
                    id="alert"

                    viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8"
                        fill="var(--wl-color-base, #1F9BF5)"
                    />
                    <path d="M7 2H9L8.5 10H7.5L7 2Z" fill="white" />
                    <circle cx="8" cy="13" r="1" fill="white" />
                </svg>

                <div class="tooltip-content">
                    {this.message}
                </div>
            </Host>
        );
    }
}
