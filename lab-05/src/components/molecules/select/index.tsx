import { twx } from "#/utils/tailwind";

const Root = twx.select`base-1 bg-background-base border border-ring-inner rounded-md px-xs py-xs text-foreground focus:outline-none focus:ring-2 focus:ring-tone-ring-inner`;

const Item = twx.option`text-foreground`;

export const Select = {
    Root,
    Item,
};
