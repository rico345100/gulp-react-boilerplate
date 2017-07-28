import React from 'react';
import assert from 'assert';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';
import Helloworld from '../src/js/components/Helloworld';

describe('<Helloworld />', () => {
	it('called componentDidMount atleast once', () => {
		sinon.spy(Helloworld.prototype, 'componentDidMount');

		const wrapper = mount(<Helloworld />);

		assert(Helloworld.prototype.componentDidMount.calledOnce, true);
	});
});