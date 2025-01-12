import { LogService } from '@common/log/log.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NodeService } from '@node/node.service';
import { ConnectNodeRequestDto } from '@node/dto/connect.request.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConnectResponseDto } from './dto/connect.response.dto';
import { DisconnectResponseDto } from './dto/disconnect.response.dto';

/**
 * Controller responsible for handling Electrum node connection-related HTTP requests.
 *
 * This controller provides endpoints to connect to and disconnect from Electrum nodes,
 * leveraging the `NodeService` to perform the underlying operations.
 */
@Controller('node')
export class NodeController {
  /**
   * Creates an instance of NodeController.
   *
   * @param nodeService Service responsible for managing Electrum node connections.
   * @param logger Service responsible for logging information and errors.
   */
  constructor(
    private readonly nodeService: NodeService,
    private readonly logger: LogService,
  ) {}

  /**
   * Establishes a connection to an Electrum node with the provided parameters.
   *
   * This endpoint accepts connection parameters in the request body, attempts to connect
   * to the specified Electrum server, and returns a confirmation message along with the
   * URI of the connected node upon successful connection.
   *
   * @param connectNodeDto - Data Transfer Object containing connection parameters:
   *   - `host`: The hostname or IP address of the Electrum server.
   *   - `port`: The port number of the Electrum server.
   *   - `ssl`: Whether to use SSL for the connection.
   *   - `network`: The Bitcoin network to connect to ('mainnet' or 'testnet').
   * @returns A promise that resolves to an object containing a confirmation message and the URI of the connected node.
   *
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if the connection to the Electrum node fails.
   */
  @Post('connect')
  @ApiOperation({ summary: 'Connect to an Electrum node' })
  @ApiResponse({ status: 200, type: ConnectResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async connectNode(
    @Body() connectNodeDto: ConnectNodeRequestDto,
  ): Promise<ConnectResponseDto> {
    this.logger.log(
      `Attempting to connect to Electrum server at ${connectNodeDto.host}:${connectNodeDto.port} using ${connectNodeDto.ssl ? 'SSL' : 'TCP'}`,
    );
    try {
      const result = await this.nodeService.connectNode(
        connectNodeDto.host,
        connectNodeDto.port,
        connectNodeDto.ssl,
        connectNodeDto.network,
      );
      this.logger.log(
        `Successfully connected to Electrum server: ${result.node}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to connect to Electrum server: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to connect to Electrum server',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Disconnects from the currently connected Electrum node.
   *
   * This endpoint attempts to disconnect from the Electrum server by delegating the
   * operation to the `NodeService`. Upon successful disconnection, it returns a
   * confirmation message.
   *
   * @returns A promise that resolves to an object containing a confirmation message.
   *
   * @throws {HttpException} Throws an INTERNAL_SERVER_ERROR if the disconnection fails.
   */
  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect from the currently connected Electrum node' })
  @ApiResponse({ status: 200, type: DisconnectResponseDto })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async disconnectNode(): Promise<DisconnectResponseDto> {
    try {
      return await this.nodeService.disconnectNode();
    } catch (error) {
      this.logger.error(
        `Failed to disconnect from Electrum server: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to disconnect from Electrum server',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
