import { ast, Program } from '../src';

describe('ast', () => {
    test('cell as ref', () => {
        const tree = ast('_ c: ^Cell = T;');
        expect(tree).toBeInstanceOf(Program);
        expect(tree).toMatchSnapshot();
    });

    test('cell no ref', () => {
        const tree = ast('_ c: Cell = T;');
        expect(tree).toBeInstanceOf(Program);
        expect(tree).toMatchSnapshot();
    });
});
