import { AnyCommandBuilder, AnyCommandData } from '../../..';
import { commandResolvablePredicate } from './predicates';

export function validateCommand(command: unknown): asserts command is (AnyCommandData|AnyCommandBuilder) {
    commandResolvablePredicate.parse(command);
}
