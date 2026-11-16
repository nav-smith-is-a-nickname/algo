export class Definition
{
    array: Array<number>;
    length: number;

    constructor(other?: Array<number>, random: boolean = false, length: number = 1024)
    {
        this.array = new Array<number>(length);
        this.length = length;
        if(other)
            this.assign(other);
        else
            if(random) this.random();
    };

    toString(): string
    {
        return `Definition(${this.array.toLocaleString()})`;
    };

    assign(other: Array<number>)
    {
        for(let i = 0; i < other.length; i++)
            (this.array[i] as number) = (other[i] as number);
    };

    random()
    {
        for (let i = 0; i < this.length; i++)
            (this.array[i] as number) = Math.random();
    };

    inplacemul(other: Definition): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) *= (other.array[i] as number);
        return this;
    };

    mul(other: Definition): Definition
    {
        return new Definition(this.array).inplacemul(other);
    };

    inplaceadd(other: Definition): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) += (other.array[i] as number);
        return this;
    };

    add(other: Definition): Definition
    {
        return new Definition(this.array).inplaceadd(other);
    };

    inplacediv(other: Definition): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) /= (other.array[i] as number);
        return this;
    };

    div(other: Definition): Definition
    {
        return new Definition(this.array).inplacediv(other);
    };

    inplacesub(other: Definition): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) -= (other.array[i] as number);
        return this;
    };

    sub(other: Definition): Definition
    {
        return new Definition(this.array).inplacesub(other);
    };

    inplacemulscalar(other: number): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) *= other;
        return this;
    };

    mulscalar(other: number): Definition
    {
        return new Definition(this.array).inplacemulscalar(other);
    };

    inplaceaddscalar(other: number): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) += other;
        return this;
    };

    addscalar(other: number): Definition
    {
        return new Definition(this.array).inplaceaddscalar(other);
    };

    inplacedivscalar(other: number): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) /= other;
        return this;
    };

    divscalar(other: number): Definition
    {
        return new Definition(this.array).inplacedivscalar(other);
    };

    inplacesubscalar(other: number): Definition
    {
        for(let i = 0; i < this.length; i++)
            (this.array[i] as number) -= other;
        return this;
    };

    subscalar(other: number): Definition
    {
        return new Definition(this.array).inplacesubscalar(other);
    };

    sqr(): Definition
    {
        return this.mul(this);
    };

    sum(): number
    {
        var sum = 0;
        for(let i = 0; i < this.length; i++) sum += (this.array[i] as number);
        return sum;
    };

    avg(): number
    {
        return this.sum() / this.length;
    };

    dot(other: Definition): number
    {
        return this.mul(other).sum();
    };

    distance(other: Definition): number
    {
        return Math.sqrt(this.sub(other).sqr().sum());
    };
};

export class Obj
{
    definition: Definition;
    pastdefs: Array<PastDef> = [];
    maxdeflength: number = 1000;

    constructor(random: boolean = true, length: number = 1024)
    {
        this.definition = new Definition(undefined, random, length);
    };

    private getdef(): void
    {
        const def = this.definition;
        this.definition.inplacesub(this.definition);
        var score = 0;
        for(const i of this.pastdefs)
        {
            score += i.score;
            def.inplaceadd(i.definition.mulscalar(i.score));
        };
        def.inplacedivscalar(score);
    };

    adddef(def: Definition, score: number)
    {
        if(this.pastdefs.length > this.maxdeflength)
        {
            var lowest_score = -1, lowest_score_num = -1;
            for (let i = 0; i < this.pastdefs.length; i++)
            {
                const element = this.pastdefs[i] as PastDef;
                if(lowest_score < 0)
                {
                    lowest_score = i;
                    lowest_score_num = element.score;
                } else if(element.score <= lowest_score_num)
                {
                    lowest_score = i;
                    lowest_score_num = element.score;
                };
            };
            if(score < lowest_score_num) return;
            delete this.pastdefs[lowest_score];
        };
        this.pastdefs.unshift(new PastDef(def, score));
        this.getdef();
    };

    distance(other: Definition): number
    {
        return other.distance(this.definition);
    };

    distanceObj(other: Obj): number
    {
        return this.distance(other.definition);
    };
};

export class PastDef
{
    definition: Definition;
    score: number;

    constructor(definition: Definition, score: number = 1)
    {
        this.definition = definition;
        this.score = 1;
    };
};

export type User = Exclude<Obj, Content>;

export class Content extends Obj
{
    sureness: number = 0;
    content: any; // this can be anything
    date: number = Date.now();
};

export class Recommendation 
{
    content: Content;
    user: User;
    level: number;

    constructor(content: Content, user: User, level: number)
    {
        this.content = content;
        this.user = user;
        this.level = level;
    };

    reportScore(score: number)
    {
        this.content.sureness += score;
        const contentdef = new Definition(this.content.definition.array);
        this.content.adddef(this.user.definition, score);
        this.user.adddef(contentdef, Math.max(score, Math.sqrt(this.content.sureness * score)));
    };
};

function randomSureness()
{
    var r = Math.random();
    if (Math.random() < 0.1)
        return (1 - Math.sqrt(r)) * 50;
    return Math.sqrt(r) * 50;
};

export class ContentList
{
    content_getter: Iterable<Content> = [];

    recommend(user: User, proximity: number, minsureness: number = randomSureness(), recency: number = 7889400000, time: number = Date.now()): Array<Recommendation>
    {
        var recommendations: Array<Recommendation> = [];
        var dist = 0;
        for(const content of this.content_getter)
        {
            if(content.sureness < minsureness)
                continue;
            if((dist = content.distanceObj(user)) > proximity)
                continue;
            recommendations.push(new Recommendation(content, user, content.sureness * dist * dist));
        };
        return recommendations.sort((a, b) => b.level - a.level);
    };
};