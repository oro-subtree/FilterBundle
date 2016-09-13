<?php

namespace Oro\Bundle\FilterBundle\Tests\Unit\DependencyInjection\CompilerPass;


use Oro\Bundle\FilterBundle\DependencyInjection\CompilerPass\FilterTypesPass;

class FilterTypesPassTest extends \PHPUnit_Framework_TestCase
{
    const TEST_TAG_ATTRIBUTE_TYPE = 'TEST_TAG_ATTRIBUTE_TYPE';
    const TEST_SERVICE_ID = 'TEST_SERVICE_ID';

    /**
     * @var FilterTypesPass
     */
    protected $filterTypePass;

    /**
     * @var PHPUnit_Framework_MockObject_MockObject
     */
    protected $containerMock;

    /**
     * @var PHPUnit_Framework_MockObject_MockObject
     */
    protected $definitionMock;

    public function setUp()
    {
        $this->filterTypePass = new FilterTypesPass();

        $this->definitionMock = $this->getMockBuilder('Symfony\Component\DependencyInjection\Definition')
            ->disableOriginalConstructor()
            ->getMock();

        $this->containerMock = $this->getMockBuilder('Symfony\Component\DependencyInjection\ContainerBuilder')
            ->disableOriginalConstructor()
            ->getMock();
    }

    public function testProcessOrm()
    {
        $this->containerMock
            ->expects($this->once())
            ->method('findTaggedServiceIds')
            ->with(FilterTypesPass::TAG_NAME)
            ->willReturn([
                self::TEST_SERVICE_ID => [ [
                    'datasource' => 'orm',
                    'type'       =>  self::TEST_TAG_ATTRIBUTE_TYPE,
                ] ]
            ]);

        $this->containerMock
            ->expects($this->once())
            ->method('hasDefinition')
            ->with(self::TEST_SERVICE_ID)
            ->willReturn(true);

        $this->containerMock
            ->expects($this->at(0))
            ->method('getDefinition')
            ->with(FilterTypesPass::FILTER_EXTENSION_ID)
            ->willReturn($this->definitionMock);

        $definitionMock2 = $this->getMockBuilder('Symfony\Component\DependencyInjection\Definition')
            ->disableOriginalConstructor()
            ->getMock();
        $definitionMock2
            ->expects($this->once())
            ->method('setPublic')
            ->with(false);

        $this->containerMock
            ->expects($this->at(3))
            ->method('getDefinition')
            ->with(self::TEST_SERVICE_ID)
            ->willReturn($definitionMock2);

        $this->definitionMock
            ->expects($this->once())
            ->method('addMethodCall');

        $this->filterTypePass->process($this->containerMock);
    }

    public function testProcessNonOrm()
    {
        $this->containerMock
            ->expects($this->once())
            ->method('findTaggedServiceIds')
            ->with(FilterTypesPass::TAG_NAME)
            ->willReturn([
                self::TEST_SERVICE_ID => [ [
                    'datasource' => 'non_orm',
                    'type'       =>  self::TEST_TAG_ATTRIBUTE_TYPE,
                ] ]
            ]);

        $this->containerMock
            ->expects($this->never())
            ->method('hasDefinition');

        $this->containerMock
            ->expects($this->at(0))
            ->method('getDefinition')
            ->with(FilterTypesPass::FILTER_EXTENSION_ID)
            ->willReturn($this->definitionMock);

        $this->definitionMock
            ->expects($this->never())
            ->method('addMethodCall');

        $this->filterTypePass->process($this->containerMock);
    }
}
